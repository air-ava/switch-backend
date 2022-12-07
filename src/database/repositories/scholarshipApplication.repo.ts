import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { IScholarshipApplication } from '../modelInterfaces';
import { ScholarshipApplication } from '../models/scholarshipApplication.model';

export const findScholarshipApplication = async (
  queryParam: Partial<IScholarshipApplication> | any,
  selectOptions: Array<keyof ScholarshipApplication>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ScholarshipApplication | undefined> => {
  return t
    ? t.manager.findOne(ScholarshipApplication, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(ScholarshipApplication).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const findMultipleScholarshipApplications = async (
  queryParam: Partial<IScholarshipApplication> | any,
  selectOptions: Array<keyof ScholarshipApplication>,
  relationOptions?: any[],

  t?: QueryRunner,
): Promise<ScholarshipApplication[]> => {
  return t
    ? t.manager.find(ScholarshipApplication, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(ScholarshipApplication).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveScholarshipApplicationREPO = (queryParams: Partial<IScholarshipApplication>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(ScholarshipApplication, queryParams) : getRepository(ScholarshipApplication).save(queryParams);
};

export const updateScholarshipApplication = (
  queryParams: Pick<IScholarshipApplication, 'id'>,
  updateFields: Partial<IScholarshipApplication>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t
    ? t.manager.update(ScholarshipApplication, queryParams, updateFields)
    : getRepository(ScholarshipApplication).update(queryParams, updateFields);
};
