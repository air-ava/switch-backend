import { QueryRunner } from 'typeorm';
import { IUser } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { saveALienDebitTransaction, saveALienTransaction } from '../database/repositories/lienTransaction.repo';
import { saveTransaction } from '../database/repositories/transaction.repo';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import { ControllerResponse } from '../utils/interface';

export const creditLedgerWallet = async ({
  amount,
  user,
  reference,
  description,
  metadata,
  walletId,
  t,
  saveToTransaction = false,
}: {
  amount: number;
  user: IUser;
  walletId: number;
  reference: string;
  description: string;
  metadata: { [key: string]: number | string };
  saveToTransaction: boolean;
  t?: QueryRunner;
}): Promise<ControllerResponse> => {
  const wallet = await WalletREPO.findWallet({ userId: user.id, id: walletId }, ['id', 'balance', 'ledger_balance'], t);
  if (!wallet) {
    return {
      success: false,
      error: 'Wallet does not exist',
    };
  }
  await WalletREPO.incrementLedgerBalance(wallet.id, amount, t);
  const { purpose, ...rest } = metadata;
  await saveALienTransaction({
    walletId: wallet.id,
    amount,
    metadata: {
      ...metadata,
      txn_type: 'credit',
      balance_after: Number(wallet.ledger_balance) + Number(amount),
      balance_before: Number(wallet.ledger_balance),
    },
    reference,
    t,
  });
  if (saveToTransaction)
    await saveTransaction({
      walletId: wallet.id,
      userId: user.id,
      amount,
      balance_after: Number(wallet.balance) + Number(0),
      balance_before: Number(wallet.balance),
      purpose,
      metadata: { ...rest, credited_into: 'ledger' },
      reference,
      status: STATUSES.PROCESSING,
      description,
      txn_type: 'credit',
      t,
    });

  if (t) t.commitTransaction();
  return {
    success: true,
    message: 'Successfully credited Lien-wallet',
  };
};

export const debitLedgerWallet = async ({
  amount,
  user,
  walletId,
  reference,
  metadata,
  t,
}: {
  amount: number;
  user: IUser;
  walletId: number;
  reference: string;
  metadata: { [key: string]: number | string };
  t?: QueryRunner;
}): Promise<ControllerResponse> => {
  if (!walletId) {
    return {
      success: false,
      error: 'Wallet identifier not found in parameters',
    };
  }
  const wallet = await WalletREPO.findWallet(
    { status: STATUSES.ACTIVE, userId: user.id, id: walletId },
    ['id', 'transaction_pin', 'ledger_balance'],
    t,
  );
  if (!wallet) {
    return {
      success: false,
      error: 'Wallet does not exist',
    };
  }

  if (Number(wallet.ledger_balance) < Number(amount)) {
    return {
      success: false,
      error: 'Ledger Balance has Insufficient balance',
    };
  }

  await WalletREPO.decrementLedgerBalance(wallet.id, Number(amount), t);

  await saveALienDebitTransaction({
    walletId: wallet.id,
    amount,
    status: STATUSES.COMPLETED,
    metadata: {
      ...metadata,
      txn_type: 'debit',
      balance_after: Number(wallet.ledger_balance) - Number(amount),
      balance_before: Number(wallet.ledger_balance),
    },
    reference,
    updated_at: new Date(),
    t,
  });
  if (t) t.commitTransaction();
  return {
    success: true,
    message: 'Transfer successful',
  };
};

