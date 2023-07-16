import randomstring from 'randomstring';
import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import { PaymentContacts } from '../models/paymentContacts.model';

export const getPreference = async (
  queryParam: Partial<PaymentContacts> | any,
  selectOptions: Array<keyof PaymentContacts>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<PaymentContacts | undefined> => {
  const repository = t ? t.manager.getRepository(PaymentContacts) : getRepository(PaymentContacts);
  return repository.findOne({
    where: queryParam,
    select: selectOptions.length ? [...selectOptions, 'id'] : undefined,
    relations: relationOptions,
  });
};

export const listPaymentContactss = async (
  queryParam: Partial<PaymentContacts> | any,
  selectOptions: Array<keyof PaymentContacts>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<PaymentContacts[]> => {
  const repository = t ? t.manager.getRepository(PaymentContacts) : getRepository(PaymentContacts);
  return repository.find({
    where: queryParam,
    select: selectOptions.length ? [...selectOptions, 'id'] : undefined,
    relations: relationOptions,
  });
};

export const createPaymentContacts = async (
  queryParams: Partial<PaymentContacts> | Partial<PaymentContacts>[] | any,
  t?: QueryRunner,
): Promise<any> => {
  const repository = t ? t.manager.getRepository(PaymentContacts) : getRepository(PaymentContacts);
  const payload = {
    code: `prf_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return repository.save(payload);
};

export const updatePaymentContacts = async (
  queryParams: Pick<PaymentContacts, 'id'>,
  updateFields: Partial<PaymentContacts> | any,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  const repository = t ? t.manager.getRepository(PaymentContacts) : getRepository(PaymentContacts);
  return repository.update(queryParams, updateFields);
};
