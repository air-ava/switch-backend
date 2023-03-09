import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { ISettlementTransactions } from '../modelInterfaces';
import { SettlementTransactions } from '../models/settlementTransactions.model';

export const saveSettlementTransaction = (
  transaction_details: Omit<ISettlementTransactions, 'id' | 'processor' | 'response' | 'created_at' | 'updated_at'> & { transaction?: QueryRunner },
): Promise<InsertResult> => {
  const { transaction } = transaction_details;
  return transaction
    ? transaction.manager.insert(SettlementTransactions, transaction_details)
    : getRepository(SettlementTransactions).insert(transaction_details);
};

export const updateSettlementTransactionREPO = (
  queryParams: Partial<ISettlementTransactions>,
  updateFields: Partial<ISettlementTransactions | any>,
  transaction?: QueryRunner,
): Promise<UpdateResult> => {
  return transaction
    ? transaction.manager.update(SettlementTransactions, queryParams, updateFields)
    : getRepository(SettlementTransactions).update(queryParams, updateFields);
};

export const getSettlementTransactionREPO = (
  queryParam: Partial<ISettlementTransactions> | any,
  selectOptions: Array<keyof SettlementTransactions>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<ISettlementTransactions | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(SettlementTransactions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(SettlementTransactions).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listSettlementTransactions = async (
  queryParam: Partial<ISettlementTransactions> | any,
  selectOptions: Array<keyof SettlementTransactions>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<SettlementTransactions[]> => {
  return transaction
    ? transaction.manager.find(SettlementTransactions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(SettlementTransactions).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};
