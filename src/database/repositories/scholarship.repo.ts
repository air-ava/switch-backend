import { QueryRunner, getRepository, In, createQueryBuilder } from 'typeorm';
import { IScholarship } from '../modelInterfaces';
import { Scholarship } from '../models/schorlaship.model';
import { ScholarshipEligibility } from '../models/scholarshipEligibility.model';
import { ScholarshipRequirement } from '../models/scholarshipRequirement.model';

export const findScholarship = async (
  queryParam: Partial<IScholarship> | any,
  selectOptions: Array<keyof Scholarship>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Scholarship | undefined> => {
  return t
    ? t.manager.findOne(Scholarship, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Scholarship).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const findMultipleScholarships = async (
  queryParam: Partial<IScholarship> | any,
  selectOptions: Array<keyof Scholarship>,
  relationOptions?: any[],

  t?: QueryRunner,
): Promise<Scholarship[]> => {
  return t
    ? t.manager.find(Scholarship, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Scholarship).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const findScholarships = async (
  queryParam: Pick<IScholarship, 'user_id' | 'org_id'>,
  // selectOptions: Array<keyof Scholarship>,
  // relationOptions?: any[],
  t?: QueryRunner,
): Promise<Scholarship[] | any> => {
  const query = t
    ? t.manager.getRepository(Scholarship).createQueryBuilder('scholarships')
    : getRepository(Scholarship).createQueryBuilder('scholarships');
  return query
    .where('scholarships.user_id = :user_id AND scholarships.org_id = :org_id', queryParam)
    .leftJoinAndSelect(ScholarshipEligibility, 'Eligibility', 'scholarships.id = Eligibility.scholarship_id')
    .leftJoinAndSelect(ScholarshipRequirement, 'linkRequirements', 'Eligibility.link_requirements = linkRequirements.reference')
    .leftJoinAndSelect(ScholarshipRequirement, 'fileRequirements', 'Eligibility.file_requirements = fileRequirements.reference')
    .getMany();
};

export const saveScholarshipREPO = (queryParams: Partial<IScholarship>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(Scholarship, queryParams) : getRepository(Scholarship).save(queryParams);
};
