import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import { MobileMoneyPayment } from '../models/mobileMoneyPayment.model';
import randomstring from 'randomstring';

export const getMobileMoneyPaymentREPO = async (
  queryParam: Partial<MobileMoneyPayment> | any,
  selectOptions: Array<keyof MobileMoneyPayment>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<MobileMoneyPayment | undefined> => {
  const repository = t ? t.manager.getRepository(MobileMoneyPayment) : getRepository(MobileMoneyPayment);
  return repository.findOne({
    where: queryParam,
    select: selectOptions.length ? [...selectOptions, 'id'] : undefined,
    relations: relationOptions,
  });
};

export const listMobileMoneyPaymentsREPO = async (
  queryParam: Partial<MobileMoneyPayment> | any,
  selectOptions: Array<keyof MobileMoneyPayment>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<MobileMoneyPayment[]> => {
  const repository = t ? t.manager.getRepository(MobileMoneyPayment) : getRepository(MobileMoneyPayment);
  return repository.find({
    where: queryParam,
    select: selectOptions.length ? [...selectOptions, 'id'] : undefined,
    relations: relationOptions,
  });
};

export const createMobileMoneyPaymentREPO = async (
  queryParams: Partial<MobileMoneyPayment> | Partial<MobileMoneyPayment>[] | any,
  t?: QueryRunner,
): Promise<any> => {
  const repository = t ? t.manager.getRepository(MobileMoneyPayment) : getRepository(MobileMoneyPayment);
  const payload = {
    code: `mmp_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return repository.save(payload);
};

export const updateMobileMoneyPaymentREPO = async (
  queryParams: Partial<MobileMoneyPayment>,
  updateFields: Partial<MobileMoneyPayment> | any,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  const repository = t ? t.manager.getRepository(MobileMoneyPayment) : getRepository(MobileMoneyPayment);
  return repository.update(queryParams, updateFields);
};
