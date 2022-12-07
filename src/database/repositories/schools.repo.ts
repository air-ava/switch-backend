import { QueryRunner, getRepository, In } from 'typeorm';
import { ISchools } from '../modelInterfaces';
import { Schools } from '../models/school.model';

export const findSchools = async (
  queryParam: Partial<ISchools> | any,
  selectOptions: Array<keyof Schools>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Schools | undefined> => {
  return t
    ? t.manager.findOne(Schools, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Schools).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const findMultipleSchoolss = async (
  queryParam: Partial<ISchools> | any,
  selectOptions: Array<keyof Schools>,
  relationOptions?: any[],

  t?: QueryRunner,
): Promise<Schools[]> => {
  return t
    ? t.manager.find(Schools, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Schools).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveSchoolsREPO = (queryParams: Partial<ISchools>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(Schools, queryParams) : getRepository(Schools).save(queryParams);
};