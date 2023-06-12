import randomstring from 'randomstring';
import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import { IBeneficiaryProductPayment } from '../modelInterfaces';
import { BeneficiaryProductPayment } from '../models/beneficiaryProductPayment.model';

export const getBeneficiaryProductPayment = async (
  queryParam: Partial<IBeneficiaryProductPayment> | any,
  selectOptions: Array<keyof BeneficiaryProductPayment>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<BeneficiaryProductPayment | undefined> => {
  const repository = t ? t.manager.getRepository(BeneficiaryProductPayment) : getRepository(BeneficiaryProductPayment);
  return repository.findOne({
    where: queryParam,
    select: selectOptions.length ? selectOptions.concat(['id']) : undefined,
    relations: relationOptions,
  });
};

export const listBeneficiaryProductPayments = async (
  queryParam: Partial<IBeneficiaryProductPayment> | Partial<IBeneficiaryProductPayment>[] | any,
  selectOptions: Array<keyof BeneficiaryProductPayment>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<BeneficiaryProductPayment[]> => {
  const repository = t ? t.manager.getRepository(BeneficiaryProductPayment) : getRepository(BeneficiaryProductPayment);
  return repository.find({
    where: queryParam,
    select: selectOptions.length ? selectOptions.concat(['id']) : undefined,
    relations: relationOptions,
  });
};

export const saveBeneficiaryProductPayment = (
  queryParams: Partial<IBeneficiaryProductPayment> | Partial<IBeneficiaryProductPayment>[] | any,
  transaction?: QueryRunner,
): Promise<any> => {
  const repository = transaction ? transaction.manager.getRepository(BeneficiaryProductPayment) : getRepository(BeneficiaryProductPayment);
  const payload = {
    code: `bpy_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return repository.save(payload);
};

export const updateBeneficiaryProductPayment = (
  queryParams: Partial<IBeneficiaryProductPayment> | any,
  updateFields: Partial<IBeneficiaryProductPayment> | any,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  const repository = t ? t.manager.getRepository(BeneficiaryProductPayment) : getRepository(BeneficiaryProductPayment);
  return repository.update(queryParams, updateFields);
};
