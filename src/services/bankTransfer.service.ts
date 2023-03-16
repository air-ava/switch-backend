// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 } from 'uuid';
import { response } from 'express';
import { Not, In } from 'typeorm';
import { STATUSES } from '../database/models/status.model';
import { BadRequestException, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { Sanitizer } from '../utils/sanitizer';
import BankRepo from '../database/repositories/bank.repo';
import BankTransferRepo from '../database/repositories/bankTransfer.repo';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import { Service as WalletService } from './wallet.service';
import Settings from './settings.service';
import { getOneTransactionREPO, updateTransactionREPO } from '../database/repositories/transaction.repo';
import { updateBankTransfer } from '../validators/payment.validator';

const Service = {
  async recordBankTransfer(data: any): Promise<theResponse> {
    const { bankId, user, walletId, bankDetails, description, note, amount, transactionPin } = data;
    const reference = v4();
    const purpose = 'Withdraw:Bank-Transfer';
    const channel = 'bank-transfer';

    const wallet = await WalletREPO.findWallet({ id: walletId }, ['id', 'currency', 'userId']);
    if (!wallet) {
      return {
        success: false,
        error: 'Wallet does not exist',
      };
    }

    // find or create Bank
    let foundBank;
    if (bankId) foundBank = await BankRepo.findBank({ id: bankId }, []);
    else {
      const { country = 'UGANDA', number, bank_name, bank_routing_number, account_name } = bankDetails;
      const coreBankDetails = { walletId: wallet.id, currency: wallet.currency };
      const defaultBankDetails = { ...coreBankDetails, number, bank_name, status: STATUSES.ACTIVE, account_name };

      const existingBank = await BankRepo.findBank(defaultBankDetails, []);
      if (existingBank) foundBank = existingBank;
      else
        foundBank = await BankRepo.saveBank({
          ...defaultBankDetails,
          bank_routing_number,
          default: false,
          country,
          type: 'beneficiary',
        });
    }
    if (!foundBank) return { success: false, error: 'Bank not found' };

    await BankTransferRepo.saveBankTransfer({
      amount,
      status: STATUSES.INITIATED,
      bankId: foundBank.id,
      narration: description,
      tx_reference: reference,
      processor: 'STEWARD',
      walletId: wallet.id,
    });

    const debitResult = await WalletService.debitWallet({
      user,
      amount,
      description,
      note,
      purpose,
      channel,
      status: STATUSES.PROCESSING,
      reference,
      transactionPin,
      wallet_id: wallet.id,
      metadata: {
        destination_account_number: foundBank.number,
        destination_bank: foundBank.bank_name,
        destination_account_name: foundBank.account_name,
      },
      // t,
    });
    if (!debitResult.success) {
      // await t.rollbackTransaction();
      await BankTransferRepo.updateBankTransfer(
        { tx_reference: reference },
        { updated_at: new Date(), response: debitResult.error, status: STATUSES.FAILED },
      );
      return BadRequestException(`${debitResult.error}`);
    }
    // await t.commitTransaction();

    const transaction = await getOneTransactionREPO({ reference }, ['description', 'metadata', 'amount', 'walletId']);
    await updateTransactionREPO({ reference }, { note });

    return sendObjectResponse('Transaction successfully', transaction);
  },

  async updateBankTransfer(data: { status: 'PROCESSING' | 'PROCESSED'; reference: string }): Promise<theResponse> {
    const { status, reference: tx_reference } = data;

    const validation = updateBankTransfer.validate(data);
    if (validation.error) return ResourceNotFoundError(validation.error);

    await BankTransferRepo.updateBankTransfer({ tx_reference }, { updated_at: new Date(), status: STATUSES[status] });
    return sendObjectResponse('Bank Transfer successfully updated');
  },

  async completeBankTransfer(data: any): Promise<theResponse> {
    const { reference, user, bankDraftCode, status } = data;

    // const validation = updateBankTransfer.validate(data);
    // if (validation.error) return ResourceNotFoundError(validation.error);

    const transaction = await getOneTransactionREPO({ reference }, ['description', 'metadata', 'amount', 'walletId']);
    if (!transaction)
      return {
        success: false,
        error: 'Transaction does not exist',
      };

    const bankTransfer = await BankTransferRepo.findBankTransfer({ tx_reference: reference }, [], ['Bank']);
    if (!bankTransfer)
      return {
        success: false,
        error: 'Transfer not initiated',
      };

    const foundBank = bankTransfer.Bank;

    const narration = `STW:${bankDraftCode}:${transaction.description}:${foundBank.number}:${foundBank.account_name}:${foundBank.bank_name}:${foundBank.bank_routing_number}`;

    // todo: Check SessionId against Bank if it is same stop
    await BankTransferRepo.updateBankTransfer(
      { tx_reference: reference },
      { updated_at: new Date(), status: STATUSES.APPROVED, sessionId: bankDraftCode },
    );

    const {
      success: debitSuccess,
      data: transactionFees,
      error: debitError,
    } = await WalletService.debitTransactionFees({
      wallet_id: transaction.walletId,
      reference,
      user,
      description: narration,
      feesNames: ['debit-fees'],
      transactionAmount: transaction.amount,
    });
    if (!debitSuccess) throw debitError;
    const feesConfig = Settings.get('TRANSACTION_FEES');
    const feesPurposeNames: string[] = [feesConfig['debit-fees'].purpose];
    await updateTransactionREPO(
      { reference, purpose: Not(In(feesPurposeNames)) },
      {
        metadata: {
          ...transaction.metadata,
          transactionFees,
          fees: feesPurposeNames,
          narration,
        },
        status: STATUSES.SUCCESS,
      },
      // t,
    );
    return sendObjectResponse('Bank Transfer successfully completed');
  },
  // todo: Complete Bank transfer which update transaction status to 'failed' and bank transfer status to 'declined'
  // todo: on Decline Reverse amount back to wallet
  // todo: Write a Cron to trigger a reminder of a pending transaction
};

export default Service;
