import { QueryRunner, getRepository } from 'typeorm';
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
