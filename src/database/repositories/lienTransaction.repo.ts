import { QueryRunner, getRepository, InsertResult, UpdateResult } from 'typeorm';
import { ILienTransaction } from '../modelInterfaces';
import { LienTransaction } from '../models/lienTransaction.model';

export const fetchAllLienTransactions = ({
  queryParam,
  selectOptions,
  includeWalletInfo = false,
  t,
}: {
  queryParam?: Partial<ILienTransaction | any>;
  selectOptions: Array<keyof LienTransaction>;
  includeWalletInfo: boolean;
  t?: QueryRunner;
}): Promise<LienTransaction[]> => {
  return t
    ? t.manager.find(LienTransaction, {
        where: queryParam,
        select: selectOptions.concat(['id']),
        order: { created_at: 'DESC' },
        ...(includeWalletInfo && { relations: ['wallet'] }),
      })
    : getRepository(LienTransaction).find({
        where: queryParam,
        select: selectOptions.concat(['id']),
        order: { created_at: 'DESC' },
        ...(includeWalletInfo && { relations: ['wallet'] }),
      });
};

export const fetchALienTransaction = (
  param: Partial<ILienTransaction | any>,
  selectOptions: Array<keyof LienTransaction>,
  t?: QueryRunner,
): Promise<LienTransaction | undefined> => {
  return t
    ? t.manager.findOne(LienTransaction, { where: param, select: selectOptions.concat(['id']) })
    : getRepository(LienTransaction).findOne({ where: param, select: selectOptions.concat(['id']) });
};

export const fetchAllActiveLienTransactions = ({
  queryParam,
  selectOptions,
  includeWalletInfo = false,
  t,
}: {
  queryParam?: Partial<ILienTransaction>;
  selectOptions: Array<keyof LienTransaction>;
  includeWalletInfo: boolean;
  t?: QueryRunner;
}): Promise<LienTransaction[]> => {
  return t
    ? t.manager.find(LienTransaction, {
        where: { ...queryParam, status: 'active' },
        select: selectOptions.concat(['id']),
        order: { created_at: 'DESC' },
        ...(includeWalletInfo && { relations: ['wallet'] }),
      })
    : getRepository(LienTransaction).find({
        where: queryParam,
        select: selectOptions.concat(['id']),
        order: { created_at: 'DESC' },
        ...(includeWalletInfo && { relations: ['wallet'] }),
      });
};

export const saveALienTransaction = (
  transaction_details: Omit<ILienTransaction, 'id' | 'status' | 'created_at' | 'blocked_at' | 'updated_at' | 'wallet'> & { t?: QueryRunner },
): Promise<InsertResult> => {
  const { t } = transaction_details;
  return t ? t.manager.insert(LienTransaction, transaction_details) : getRepository(LienTransaction).insert(transaction_details);
};

export const saveALienDebitTransaction = (
  transaction_details: Omit<ILienTransaction, 'id' | 'blocked_at' | 'created_at' | 'wallet'> & { t?: QueryRunner },
): Promise<InsertResult> => {
  const { t } = transaction_details;
  return t ? t.manager.insert(LienTransaction, transaction_details) : getRepository(LienTransaction).insert(transaction_details);
};

export const updateStatusOfALienTransaction = (
  requestDetails: Pick<ILienTransaction, 'reference' | 'status'>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  const { reference, status } = requestDetails;
  return t
    ? t.manager.update(LienTransaction, { reference }, { status, updated_at: new Date() })
    : getRepository(LienTransaction).update({ reference }, { status, updated_at: new Date() });
};
