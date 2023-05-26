import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { ISchoolClass } from '../modelInterfaces';
import { SchoolClass } from '../models/schoolClass.model';

export const getSchoolClass = async (
  queryParam: Partial<ISchoolClass> | any,
  selectOptions: Array<keyof SchoolClass>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<SchoolClass | undefined> => {
  return t
    ? t.manager.findOne(SchoolClass, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(SchoolClass).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listSchoolClass = async (
  queryParam: Partial<ISchoolClass> | any,
  selectOptions: Array<keyof SchoolClass>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<SchoolClass[]> => {
  return t
    ? t.manager.find(SchoolClass, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(SchoolClass).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveSchoolClass = (queryParams: Partial<ISchoolClass> | Partial<ISchoolClass>[] | any, transaction?: QueryRunner): Promise<any> => {
  const payload = {
    code: `shc_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return transaction ? transaction.manager.save(SchoolClass, payload) : getRepository(SchoolClass).save(payload);
};

export const updateSchoolClass = (
  queryParams: Pick<ISchoolClass, 'id'>,
  updateFields: Partial<ISchoolClass>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(SchoolClass, queryParams, updateFields) : getRepository(SchoolClass).update(queryParams, updateFields);
};
