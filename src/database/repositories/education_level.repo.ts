import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import { IEducationLevel } from '../modelInterfaces';
import { EducationLevel } from '../models/education_level.model';

export const getEducationLevel = async (
  queryParam: Partial<IEducationLevel> | any,
  selectOptions: Array<keyof EducationLevel>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<EducationLevel | undefined> => {
  return t
    ? t.manager.findOne(EducationLevel, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(EducationLevel).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listEducationLevel = async (
  queryParam: Partial<IEducationLevel> | any,
  selectOptions: Array<keyof EducationLevel>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<EducationLevel[]> => {
  return t
    ? t.manager.find(EducationLevel, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(EducationLevel).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveEducationLevel = (
  queryParams: Partial<IEducationLevel> | Partial<IEducationLevel>[] | any,
  transaction?: QueryRunner,
): Promise<any> => {
  return transaction ? transaction.manager.save(EducationLevel, queryParams) : getRepository(EducationLevel).save(queryParams);
};

export const updateEducationLevel = (
  queryParams: Partial<IEducationLevel>,
  updateFields: Partial<IEducationLevel> | any,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(EducationLevel, queryParams, updateFields) : getRepository(EducationLevel).update(queryParams, updateFields);
};
