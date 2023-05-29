import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import { IEducationPeriod } from '../modelInterfaces';
import { EducationPeriod } from '../models/education_period.model';

export const getEducationPeriod = async (
  queryParam: Partial<IEducationPeriod> | any,
  selectOptions: Array<keyof EducationPeriod>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<EducationPeriod | undefined> => {
  return t
    ? t.manager.findOne(EducationPeriod, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(EducationPeriod).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listEducationPeriod = async (
  queryParam: Partial<IEducationPeriod> | any,
  selectOptions: Array<keyof EducationPeriod>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<EducationPeriod[]> => {
  return t
    ? t.manager.find(EducationPeriod, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(EducationPeriod).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveEducationPeriod = (
  queryParams: Partial<IEducationPeriod> | Partial<IEducationPeriod>[] | any,
  transaction?: QueryRunner,
): Promise<any> => {
  return transaction ? transaction.manager.save(EducationPeriod, queryParams) : getRepository(EducationPeriod).save(queryParams);
};

export const updateEducationPeriod = (
  queryParams: Partial<IEducationPeriod>,
  updateFields: Partial<IEducationPeriod> | any,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(EducationPeriod, queryParams, updateFields) : getRepository(EducationPeriod).update(queryParams, updateFields);
};
