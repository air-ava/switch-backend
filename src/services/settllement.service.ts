import { Not, In } from 'typeorm';
// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 } from 'uuid';
import Settings from './settings.service';
import { STATUSES } from '../database/models/status.model';
import { getSettlementTransactionREPO, listSettlementTransactions, saveSettlementTransaction } from '../database/repositories/settlementTransactions.repo';
import { getListOfTransactionsForSettlement, getTotalSuccessfulDebit, updateTransactionREPO } from '../database/repositories/transaction.repo';
import { sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import BankRepo from '../database/repositories/bank.repo';
import { getQueryRunner } from '../database/helpers/db';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import { Service as WalletService } from './wallet.service';
import { Sanitizer } from '../utils/sanitizer';

const Service = {
  async recordSettlementTransaction(data: any): Promise<theResponse> {
    const { bankId = null, amount = null, selectedDate = new Date(), user } = data;

    const settlementDate = new Date(selectedDate);
    const reference = v4();
    const purpose = 'Withdraw:Settlement';
    // const t = await getQueryRunner();

    const { success: getWallet, data: wallet, error: walletError } = await WalletService.getSchoolWallet({ user });
    if (!getWallet) throw walletError;

    const {
      transactions: creditTransactions,
      transactionCount,
      transactionTotal,
    } = await getListOfTransactionsForSettlement(wallet.id, settlementDate, 'Fees:');
    const debitedTransactions = await getTotalSuccessfulDebit(wallet.id, 'Fees:');
    const total = transactionTotal - (debitedTransactions as { totalOut: number }).totalOut;
    // console.log({
    //   debitedTransactions,
    //   total,
    //   selectedDate,
    //   walletId: wallet.id,
    //   transactionTotal,
    //   transactionCount,
    //   creditTransactions: creditTransactions.splice(25, 28),
    // });
    const description = `Settlement for ${transactionCount} transactions at ${transactionTotal}`;

    const coreBankDetails = { walletId: wallet.id, currency: wallet.currency };
    const defaultBankDetails = { ...(bankId ? { id: bankId } : { ...coreBankDetails, default: true }), status: STATUSES.ACTIVE };
    const foundBank = await BankRepo.findBank(defaultBankDetails, []);
    if (!foundBank) return { success: false, error: 'Bank not found' };

    // todo: process payment handled here

    const debitPayload = {
      user,
      amount: total,
      description,
      purpose,
      reference,
      wallet_id: wallet.id,
      // t,
    };
    const withdrawal = await WalletService.debitWallet(debitPayload);
    if (!withdrawal.success) return withdrawal;
    const {
      success: debitSuccess,
      data: transactionFees,
      error: debitError,
    } = await WalletService.debitTransactionFees({
      wallet_id: wallet.id,
      reference,
      user,
      description,
      feesNames: ['debit-fees'],
      transactionAmount: total,
      // t,
    });
    if (!debitSuccess) throw debitError;

    const feesConfig = Settings.get('TRANSACTION_FEES');
    const feesPurposeNames: string[] = [feesConfig['debit-fees'].purpose];
    await updateTransactionREPO(
      { reference, purpose: Not(In(feesPurposeNames)) },
      {
        metadata: {
          transactionFees,
          fees: feesPurposeNames,
        },
      },
      // t,
    );

    // await t.commitTransaction();

    await saveSettlementTransaction({
      processor_transaction_id: 'asas121',
      tx_reference: reference,
      tx_count: transactionCount,
      bankId: foundBank.id,
      status: STATUSES.PROCESSING,
    });

    return withdrawal;
  },

  async listSettlements(data: any): Promise<theResponse> {
    const response = await listSettlementTransactions({}, [], ['Bank', 'Transactions', 'Transactions.Wallet']);
    return sendObjectResponse('Settlements retrieved successfully', Sanitizer.sanitizeAllArray(response, Sanitizer.sanitizeSettlement));
  },

  async getSettlement(data: any): Promise<theResponse> {
    const { settlementId } = data;
    const response = await getSettlementTransactionREPO({ id: settlementId }, [], ['Bank', 'Transactions', 'Transactions.Wallet']);
    const [{ walletId, created_at, Wallet }] = response.Transactions;

    const { transactions, transactionCount, transactionTotal } = await getListOfTransactionsForSettlement(walletId, created_at, 'Fees:');
    const amountSettled = Sanitizer.filterTransactionsByPurpose(response.Transactions, 'Withdraw:Settlement');

    response.amountSettled = Number(amountSettled.amount);
    response.transactionCount = transactionCount;
    response.creditTransactions = transactions;
    response.total = transactionTotal;
    return sendObjectResponse('Settlement retrieved successfully', Sanitizer.sanitizeSettlement(response));
  },
};

export default Service;
