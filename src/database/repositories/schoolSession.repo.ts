import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { ISchoolSession } from '../modelInterfaces';
import { SchoolSession } from '../models/schoolSession.model';

export const getSchoolSession = async (
  queryParam: Partial<ISchoolSession> | any,
  selectOptions: Array<keyof SchoolSession>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<SchoolSession | undefined> => {
  return t
    ? t.manager.findOne(SchoolSession, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(SchoolSession).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listSchoolSession = async (
  queryParam: Partial<ISchoolSession> | any,
  selectOptions: Array<keyof SchoolSession>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<SchoolSession[]> => {
  return t
    ? t.manager.find(SchoolSession, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(SchoolSession).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveSchoolSession = (
  queryParams: Partial<ISchoolSession> | Partial<ISchoolSession>[] | any,
  transaction?: QueryRunner,
): Promise<any> => {
  const payload = {
    code: `shs_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return transaction ? transaction.manager.save(SchoolSession, payload) : getRepository(SchoolSession).save(payload);
};

export const updateSchoolSession = (
  queryParams: Partial<ISchoolSession> | any,
  updateFields: Partial<ISchoolSession> | any,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(SchoolSession, queryParams, updateFields) : getRepository(SchoolSession).update(queryParams, updateFields);
};
