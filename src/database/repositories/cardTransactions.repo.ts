import { getRepository, InsertResult, QueryRunner, UpdateResult } from 'typeorm';
import { ICardTransactions } from '../modelInterfaces';
import { CardTransactions } from '../models/cardTransaction.model';

export const saveCardTransaction = async (queryParam: Partial<ICardTransactions>, t?: QueryRunner): Promise<InsertResult> =>
  t ? t.manager.insert(CardTransactions, queryParam) : getRepository(CardTransactions).insert(queryParam);

export const updateCardTransaction = async (
  queryParam: Partial<ICardTransactions>,
  updateFields: Partial<ICardTransactions>,
  t?: QueryRunner,
): Promise<UpdateResult> =>
  t ? t.manager.update(CardTransactions, queryParam, updateFields) : getRepository(CardTransactions).update(queryParam, updateFields);

export const getOneCardTransactionREPO = (
  queryParam: Partial<ICardTransactions | any>,
  selectOptions: Array<keyof CardTransactions>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<ICardTransactions | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(CardTransactions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(CardTransactions).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};
