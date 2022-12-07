import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { ITransactions } from '../modelInterfaces';
import { Transactions } from '../models/transaction.model';

export const saveTransaction = (
  transaction_details: Omit<ITransactions, 'id' | 'created_at' | 'updated_at'> & { t?: QueryRunner },
): Promise<InsertResult> => {
  const { t } = transaction_details;
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
  updateFields: Partial<ITransactions>,
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
      })
    : getRepository(Transactions).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};
