import { QueryRunner, getRepository, In } from 'typeorm';
import { IPendingPayments } from '../modelInterfaces';
import { PendingPayments } from '../models/payment.model';

export const findPendingPayment = async (
  queryParam: Partial<IPendingPayments> | any,
  selectOptions: Array<keyof PendingPayments>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<PendingPayments | undefined> => {
  return t
    ? t.manager.findOne(PendingPayments, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(PendingPayments).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const findMultiplePendingPaymentss = async (
  queryParam: Partial<IPendingPayments> | any,
  selectOptions: Array<keyof PendingPayments>,
  relationOptions?: any[],

  t?: QueryRunner,
): Promise<PendingPayments[]> => {
  return t
    ? t.manager.find(PendingPayments, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(PendingPayments).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const savePendingPaymentsREPO = (queryParams: Partial<IPendingPayments>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(PendingPayments, queryParams) : getRepository(PendingPayments).save(queryParams);
};
