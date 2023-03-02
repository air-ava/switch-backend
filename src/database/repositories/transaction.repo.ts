/* eslint-disable no-param-reassign */
import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { ITransactions } from '../modelInterfaces';
import { Transactions } from '../models/transaction.model';

export const saveTransaction = (
  transaction_details: Omit<ITransactions, 'id' | 'note' | 'document_reference' | 'created_at' | 'updated_at'> & { t?: QueryRunner },
): Promise<InsertResult> => {
  const { t, purpose } = transaction_details;
  if (purpose.includes('Fees:')) transaction_details.channel = 'wallet';
  return t ? t.manager.insert(Transactions, transaction_details) : getRepository(Transactions).insert(transaction_details);
};

export const getTransactionByExternalRef = (external_reference: string, t?: QueryRunner): Promise<{ existingtransaction: string }[]> => {
  return t
    ? t.manager.query(
        `SELECT metadata -> 'external_reference' as existingTransaction FROM transactions WHERE metadata ->> 'external_reference' = '${external_reference}'`,
      )
    : getRepository(Transactions).query(
        `SELECT metadata -> 'external_reference' as existingTransaction FROM transactions WHERE metadata ->> 'external_reference' = '${external_reference}'`,
      );
};

export const createTransactionREPO = (
  queryParams: Omit<ITransactions, 'id' | 'created_at' | 'updated_at'>,
  transaction?: QueryRunner,
): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Transactions, queryParams) : getRepository(Transactions).insert(queryParams);
};

export const createAndGetTransactionREPO = (
  queryParams: Omit<ITransactions, 'id' | 'created_at' | 'updated_at'>,
  transaction?: QueryRunner,
): Promise<Transactions> => {
  return transaction ? transaction.manager.save(Transactions, queryParams) : getRepository(Transactions).save(queryParams);
};

export const getOneTransactionREPO = (
  queryParam: Partial<ITransactions | any>,
  selectOptions: Array<keyof Transactions>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<ITransactions | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Transactions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Transactions).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const updateTransactionREPO = (
  queryParams: Partial<ITransactions>,
  updateFields: Partial<ITransactions | any>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(Transactions, queryParams, updateFields) : getRepository(Transactions).update(queryParams, updateFields);
};

export const getTransactionsREPO = (
  queryParam:
    | Partial<ITransactions>
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }
    | any,
  selectOptions: Array<keyof Transactions>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ITransactions[]> => {
  return t
    ? t.manager.find(Transactions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
        order: { created_at: 'DESC' },
      })
    : getRepository(Transactions).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
        order: { created_at: 'DESC' },
      });
};

export const getTotalCredited = (userId: string): Promise<{ total: number } | undefined> => {
  return getRepository(Transactions)
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalIn')
    .where('transaction.txn_type = :txn_type AND transaction.userId = :userId', { txn_type: 'credit', userId })
    .getRawOne();
};

export const getTotalSuccessfulCredit = (userId: string): Promise<{ total: number } | undefined> => {
  return getRepository(Transactions)
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalIn')
    .where('transaction.txn_type = :txn_type AND transaction.userId = :userId AND transaction.status = 14', { txn_type: 'credit', userId })
    .getRawOne();
};

export const getTotalDebited = (userId: string): Promise<{ total: number } | undefined> => {
  return getRepository(Transactions)
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalOut')
    .where('transaction.txn_type = :txn_type AND transaction.userId = :userId', { txn_type: 'debit', userId })
    .getRawOne();
};
