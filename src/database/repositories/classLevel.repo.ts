import randomstring from 'randomstring';
import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import { IClassLevel } from '../modelInterfaces';
import { ClassLevel } from '../models/class.model';

export const getClassLevel = async (
  queryParam: Partial<IClassLevel> | any,
  selectOptions: Array<keyof ClassLevel>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ClassLevel | undefined> => {
  return t
    ? t.manager.findOne(ClassLevel, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(ClassLevel).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listClassLevel = async (
  queryParam: Partial<IClassLevel> | any,
  selectOptions: Array<keyof ClassLevel>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ClassLevel[]> => {
  return t
    ? t.manager.find(ClassLevel, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(ClassLevel).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveClassLevel = (queryParams: Partial<IClassLevel> | Partial<IClassLevel>[] | any, transaction?: QueryRunner): Promise<any> => {
  const payload = {
    code: `cll_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return transaction ? transaction.manager.save(ClassLevel, payload) : getRepository(ClassLevel).save(payload);
};

export const updateClassLevel = (queryParams: Partial<IClassLevel>, updateFields: Partial<IClassLevel>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(ClassLevel, queryParams, updateFields) : getRepository(ClassLevel).update(queryParams, updateFields);
};
