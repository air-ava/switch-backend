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
