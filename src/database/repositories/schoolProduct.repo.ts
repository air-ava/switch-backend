import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { ISchoolProduct } from '../modelInterfaces';
import { SchoolProduct } from '../models/schoolProduct.model';

export const getSchoolProduct = async (
  queryParam: Partial<ISchoolProduct> | any,
  selectOptions: Array<keyof SchoolProduct>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<SchoolProduct | undefined> => {
  return t
    ? t.manager.findOne(SchoolProduct, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(SchoolProduct).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listSchoolProduct = async (
  queryParam: Partial<ISchoolProduct> | any,
  selectOptions: Array<keyof SchoolProduct>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<SchoolProduct[]> => {
  return t
    ? t.manager.find(SchoolProduct, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(SchoolProduct).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveSchoolProduct = (
  queryParams: Partial<ISchoolProduct> | Partial<ISchoolProduct>[] | any,
  transaction?: QueryRunner,
): Promise<any> => {
  const payload = {
    code: `shp_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return transaction ? transaction.manager.save(SchoolProduct, payload) : getRepository(SchoolProduct).save(payload);
};

export const updateSchoolProduct = (
  queryParams: Pick<ISchoolProduct, 'id'>,
  updateFields: Partial<ISchoolProduct> | any,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(SchoolProduct, queryParams, updateFields) : getRepository(SchoolProduct).update(queryParams, updateFields);
};

export const listFees = async (queryParam: Partial<ISchoolProduct> | any): Promise<SchoolProduct[]> => {
  const { foundSchoolClass, sessions, status, schoolId } = queryParam;
  const repository = getRepository(SchoolProduct).createQueryBuilder('product');
  return (
    repository
      .where('product.school_class_id IN (:...ids)', { ids: [null, ...foundSchoolClass] })
      // .andWhere('product.session IN (:...sessions)', { sessions: [null, ...sessions] })
      .andWhere('product.status != :status', { status })
      .andWhere('product.school_id = :schoolId', { schoolId })
      .getMany()
  );
};

export const schoolFeesDetails = async (queryParams: any): Promise<any> => {
  const { schoolId } = queryParams;
  const queryBuilder = getRepository(SchoolProduct).createQueryBuilder('SchoolFee');
  const query = queryBuilder
    .leftJoinAndSelect('SchoolFee.FeesPaymentRecords', 'FeeRecords')
    .select('COUNT(SchoolFee.id)', 'feeCount')
    .addSelect('SUM(SchoolFee.amount)', 'totalFees')
    .addSelect('SchoolFee.currency', 'currency')
    .addSelect('SUM(FeeRecords.amount_paid)', 'sumPaid')
    .addSelect('SUM(FeeRecords.amount_outstanding)', 'sumOutstanding')
    .where('SchoolFee.status = :status AND SchoolFee.school_id = :schoolId AND FeeRecords.beneficiary_type = :beneficiaryType', {
      status: 1,
      schoolId,
      beneficiaryType: 'student',
    });
  const analytics = await query.groupBy('SchoolFee.currency').getRawMany();
  return analytics;
};
