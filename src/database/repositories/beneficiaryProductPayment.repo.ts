import randomstring from 'randomstring';
import { QueryRunner, getRepository, UpdateResult, Not } from 'typeorm';
import { IBeneficiaryProductPayment } from '../modelInterfaces';
import { BeneficiaryProductPayment } from '../models/beneficiaryProductPayment.model';
import { STATUSES } from '../models/status.model';

export const getBeneficiaryProductPayment = async (
  queryParam: Partial<IBeneficiaryProductPayment> | any,
  selectOptions: Array<keyof BeneficiaryProductPayment> = [],
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

export const sumPaymentsAndOutstandings = async (
  queryParam: Partial<IBeneficiaryProductPayment> | Partial<IBeneficiaryProductPayment>[] | any,
): Promise<any | any[]> => {
  const { status = STATUSES.DELETED, beneficiary_id, beneficiary_type = 'student' } = queryParam;
  console.log({ beneficiary_id });
  const repository = getRepository(BeneficiaryProductPayment);

  const query = repository
    .createQueryBuilder('payment')
    .select('SUM(payment.amount_paid)', 'total_paid')
    .addSelect('SUM(payment.amount_outstanding)', 'total_outstanding')
    .where('payment.beneficiary_id = :beneficiary_id', { beneficiary_id })
    .andWhere('payment.beneficiary_type = :beneficiary_type', { beneficiary_type })
    .andWhere('payment.status <> :status', { status });

  const sums = await query.getRawOne();
  return sums;
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

export const incrementAmountPaid = (id: number, amount: number, t?: QueryRunner): Promise<UpdateResult> => {
  const repository = t ? t.manager.getRepository(BeneficiaryProductPayment) : getRepository(BeneficiaryProductPayment);
  return repository.increment({ id }, 'amount_paid', amount);
};

export const decrementAmountPaid = (id: number, amount: number, t?: QueryRunner): Promise<UpdateResult> => {
  const repository = t ? t.manager.getRepository(BeneficiaryProductPayment) : getRepository(BeneficiaryProductPayment);
  return repository.decrement({ id }, 'amount_paid', amount);
};

export const incrementAmountOutstanding = (id: number, amount: number, t?: QueryRunner): Promise<UpdateResult> => {
  const repository = t ? t.manager.getRepository(BeneficiaryProductPayment) : getRepository(BeneficiaryProductPayment);
  return repository.increment({ id }, 'amount_outstanding', amount);
};

export const decrementAmountOutstanding = (id: number, amount: number, t?: QueryRunner): Promise<UpdateResult> => {
  const repository = t ? t.manager.getRepository(BeneficiaryProductPayment) : getRepository(BeneficiaryProductPayment);
  return repository.decrement({ id }, 'amount_outstanding', amount);
};

export const increaseOutstandingAmount = (
  queryParams: Partial<IBeneficiaryProductPayment> | any,
  amount: number,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  const repository = t ? t.manager.getRepository(BeneficiaryProductPayment) : getRepository(BeneficiaryProductPayment);
  const payload = {
    ...queryParams,
    status: Not(STATUSES.DELETED),
  };
  return repository.increment(payload, 'amount_outstanding', amount);
};
