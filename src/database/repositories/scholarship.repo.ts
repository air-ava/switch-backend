import { QueryRunner, getRepository, In } from 'typeorm';
import { IScholarship } from '../modelInterfaces';
import { Scholarship } from '../models/schorlaship.model';

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

export const saveScholarshipREPO = (queryParams: Partial<IScholarship>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(Scholarship, queryParams) : getRepository(Scholarship).save(queryParams);
};
