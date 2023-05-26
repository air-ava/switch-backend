import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { ISchoolPeriod } from '../modelInterfaces';
import { SchoolPeriod } from '../models/schoolPeriod.model';

export const getSchoolPeriod = async (
  queryParam: Partial<ISchoolPeriod> | any,
  selectOptions: Array<keyof SchoolPeriod>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<SchoolPeriod | undefined> => {
  return t
    ? t.manager.findOne(SchoolPeriod, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(SchoolPeriod).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listSchoolPeriod = async (
  queryParam: Partial<ISchoolPeriod> | any,
  selectOptions: Array<keyof SchoolPeriod>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<SchoolPeriod[]> => {
  return t
    ? t.manager.find(SchoolPeriod, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(SchoolPeriod).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveSchoolPeriod = (queryParams: Partial<ISchoolPeriod> | Partial<ISchoolPeriod>[] | any, transaction?: QueryRunner): Promise<any> => {
  const payload = {
    code: `shp_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return transaction ? transaction.manager.save(SchoolPeriod, payload) : getRepository(SchoolPeriod).save(payload);
};

export const updateSchoolPeriod = (
  queryParams: Pick<ISchoolPeriod, 'id'>,
  updateFields: Partial<ISchoolPeriod> | any,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(SchoolPeriod, queryParams, updateFields) : getRepository(SchoolPeriod).update(queryParams, updateFields);
};
