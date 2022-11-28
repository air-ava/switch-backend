import { QueryRunner, getRepository, In } from 'typeorm';
import { IScholarshipEligibility } from '../modelInterfaces';
import { ScholarshipEligibility } from '../models/scholarshipEligibility.model';

export const findScholarshipEligibility = async (
  queryParam: Partial<IScholarshipEligibility> | any,
  selectOptions: Array<keyof ScholarshipEligibility>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ScholarshipEligibility | undefined> => {
  return t
    ? t.manager.findOne(ScholarshipEligibility, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(ScholarshipEligibility).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const findMultipleScholarshipEligibilitys = async (
  queryParam: Partial<IScholarshipEligibility> | any,
  selectOptions: Array<keyof ScholarshipEligibility>,
  relationOptions?: any[],

  t?: QueryRunner,
): Promise<ScholarshipEligibility[]> => {
  return t
    ? t.manager.find(ScholarshipEligibility, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(ScholarshipEligibility).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveScholarshipEligibilityREPO = (queryParams: Partial<IScholarshipEligibility>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(ScholarshipEligibility, queryParams) : getRepository(ScholarshipEligibility).save(queryParams);
};
