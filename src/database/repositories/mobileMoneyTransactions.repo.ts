import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { IMobileMoneyTransactions } from '../modelInterfaces';
import { MobileMoneyTransactions } from '../models/mobileMoneyTransactions.model';

export const saveMobileMoneyTransaction = (
  transaction_details: Omit<IMobileMoneyTransactions, 'id' | 'processor' | 'response' | 'created_at' | 'updated_at'> & { t?: QueryRunner },
): Promise<InsertResult> => {
  const { t } = transaction_details;
  return t ? t.manager.insert(MobileMoneyTransactions, transaction_details) : getRepository(MobileMoneyTransactions).insert(transaction_details);
};

export const updateMobileMoneyTransactionREPO = (
  queryParams: Partial<IMobileMoneyTransactions>,
  updateFields: Partial<IMobileMoneyTransactions | any>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t
    ? t.manager.update(MobileMoneyTransactions, queryParams, updateFields)
    : getRepository(MobileMoneyTransactions).update(queryParams, updateFields);
};
