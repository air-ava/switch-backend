import { QueryRunner, getRepository, In } from 'typeorm';
import { IScholarshipRequirement } from '../modelInterfaces';
import { ScholarshipRequirement } from '../models/scholarshipRequirement.model';

export const findScholarshipRequirement = async (
  queryParam: Partial<IScholarshipRequirement> | any,
  selectOptions: Array<keyof ScholarshipRequirement>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ScholarshipRequirement | undefined> => {
  return t
    ? t.manager.findOne(ScholarshipRequirement, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(ScholarshipRequirement).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const findMultipleScholarshipRequirements = async (
  queryParam: Partial<IScholarshipRequirement> | any,
  selectOptions: Array<keyof ScholarshipRequirement>,
  relationOptions?: any[],

  t?: QueryRunner,
): Promise<ScholarshipRequirement[]> => {
  return t
    ? t.manager.find(ScholarshipRequirement, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(ScholarshipRequirement).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveScholarshipRequirementREPO = (queryParams: Partial<IScholarshipRequirement>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(ScholarshipRequirement, queryParams) : getRepository(ScholarshipRequirement).save(queryParams);
};
