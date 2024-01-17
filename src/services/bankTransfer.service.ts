// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 } from 'uuid';
import { response } from 'express';
import { Not, In, QueryRunner } from 'typeorm';
import { STATUSES } from '../database/models/status.model';
import { BadRequestError, BadRequestException, NotFoundError, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { Sanitizer } from '../utils/sanitizer';
import BankAccountRepo from '../database/repositories/bankAccount.repo';
import BankTransferRepo from '../database/repositories/bankTransfer.repo';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import { Service as WalletService } from './wallet.service';
import Settings from './settings.service';
import { getOneTransactionREPO, updateTransactionREPO } from '../database/repositories/transaction.repo';
import { completeBankTransfer, updateBankTransfer } from '../validators/payment.validator';
import { findUser } from '../database/repositories/user.repo';
import { createAsset } from './assets.service';
import { sendSlackMessage } from '../integration/extra/slack.integration';

const Service = {
  async findOrCreateBankAccount({
    bankDetails,
    bankId,
    wallet = Settings.get('WALLET'),
    t,
  }: {
    bankDetails: any;
    bankId?: number;
    wallet: any;
    t?: QueryRunner;
  }): Promise<theResponse> {
    let foundBank;

    if (bankId) foundBank = await BankAccountRepo.findBank({ id: bankId }, []);
    else {
      const { country = Settings.get('COUNTRY'), number, bank_name, bank_routing_number, account_name } = bankDetails;
      const coreBankDetails = { walletId: wallet.id, currency: wallet.currency };
      const defaultBankDetails = { ...coreBankDetails, number, bank_name, status: STATUSES.ACTIVE, account_name };

      const existingBank = await BankAccountRepo.findBank(defaultBankDetails, []);
      if (existingBank) foundBank = existingBank;
      else
        foundBank = await BankAccountRepo.saveBank(
          {
            ...defaultBankDetails,
            bank_routing_number,
            default: false,
            country,
            type: 'beneficiary',
          },
          t && t,
        );
    }

    if (!foundBank) throw new NotFoundError('Bank');

    return sendObjectResponse('Bank retrieved successfully', foundBank);
  },

  async recordBankTransfer(payload: any): Promise<theResponse> {
    const { bankId, user, walletId, bankDetails, description, note, amount, transactionPin, school } = payload;
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
    const { data: foundBank } = await Service.findOrCreateBankAccount({ bankDetails, bankId, wallet });

    const createdBankTransfer = await BankTransferRepo.saveBankTransfer({
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

    await sendSlackMessage({
      body: {
        amount: `${wallet.currency}${amount / 100}`,
        reference,
        bankName: foundBank.bank_name,
        schoolName: school.name,
        initiator: `${user.first_name} ${user.last_name}`,
        createdAt: `${createdBankTransfer.created_at}`,
        accountName: foundBank.account_name,
        narration: description,
        accountNumber: foundBank.number,
      },
      feature: 'bank_transfer',
    });

    return sendObjectResponse('Transaction successfully', transaction);
  },

  async updateBankTransfer(data: { status: 'PROCESSING' | 'PROCESSED'; reference: string }): Promise<theResponse> {
    const { status, reference: tx_reference } = data;

    console.log({ data, status: STATUSES[status] });
    const validation = updateBankTransfer.validate(data);
    if (validation.error) return ResourceNotFoundError(validation.error);

    await BankTransferRepo.updateBankTransfer({ tx_reference }, { updated_at: new Date(), status: STATUSES[status] });
    return sendObjectResponse('Bank Transfer successfully updated');
  },

  async completeBankTransfer(data: any): Promise<theResponse> {
    const { reference, user, bankDraftCode, bankName, accountName, accountNumber, documents } = data;

    const validation = completeBankTransfer.validate(data);
    if (validation.error) return ResourceNotFoundError(validation.error);

    const foundUser = await findUser({ id: user }, []);
    if (!foundUser) throw Error('User account Not Found');
    // if (foundUser.status === STATUSES.INACTIVE) throw Error('Your account has been disabled');

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
    const process = 'completeBankTransfer';

    await Promise.all(
      documents.map((document: string) =>
        createAsset({
          imagePath: document,
          user: user.id,
          trigger: `${process}:add_reciepts`,
          reference,
          organisation: user.organisation,
          entity: 'bankTransfer',
          entity_id: bankTransfer.id,
        }),
      ),
    );

    // todo: Check SessionId against Bank if it is same stop
    // todo: Save all banks recorded
    await BankTransferRepo.updateBankTransfer(
      { tx_reference: reference },
      {
        updated_at: new Date(),
        status: STATUSES.APPROVED,
        sessionId: bankDraftCode,
        ...(documents && { document_reference: reference }),
        metadata: JSON.stringify({ bankName, accountName, accountNumber }),
      },
    );

    const {
      success: debitSuccess,
      data: transactionFees,
      error: debitError,
    } = await WalletService.debitTransactionFees({
      wallet_id: transaction.walletId,
      reference,
      user: foundUser,
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

  async listBankTransfer(data: any): Promise<theResponse> {
    const bankTransfers = await BankTransferRepo.findBankTransfers(
      { status: Not(STATUSES.FAILED) },
      [],
      ['Wallet', 'Bank', 'Transactions', 'Assets'],
    );
    return sendObjectResponse('Bank Transfer successfully retrieved', Sanitizer.sanitizeAllArray(bankTransfers, Sanitizer.sanitizeBankTransfer));
  },

  async getBankTransfer(data: any): Promise<theResponse> {
    const { id } = data;

    // const validation = updateBankTransfer.validate(data);
    // if (validation.error) return ResourceNotFoundError(validation.error);

    const bankTransfer = await BankTransferRepo.findBankTransfer({ id }, [], ['Wallet', 'Bank', 'Transactions', 'Assets']);
    if (!bankTransfer) return ResourceNotFoundError({ message: 'Bank transfer not found' });
    if (bankTransfer.status === STATUSES.FAILED) return ResourceNotFoundError({ message: 'This is a failed bank transfer' });

    return sendObjectResponse('Bank Transfer successfully retrieved', Sanitizer.sanitizeBankTransfer(bankTransfer));
  },
  // todo: Complete Bank transfer which update transaction status to 'failed' and bank transfer status to 'declined'
  // todo: on Decline Reverse amount back to wallet
  // todo: Write a Cron to trigger a reminder of a pending transaction

  async notifySlack(data: any): Promise<theResponse> {
    const { body, feature = 'bank_transfer' } = data;
    const { amount, reference, bankName, userMobile } = body;
    await sendSlackMessage({ body, feature });
    return sendObjectResponse('Slack Notification sent successfully');
  },
};

export default Service;
