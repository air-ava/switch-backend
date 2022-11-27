import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { IOrganisation } from '../modelInterfaces';
import { Organisation } from '../models/organisation.model';

export const createOrganisationREPO = (queryParams: Partial<IOrganisation>, transaction?: QueryRunner): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Organisation, queryParams) : getRepository(Organisation).insert(queryParams);
};

export const getOneOrganisationREPO = (
  queryParam: Partial<IOrganisation | any>,
  selectOptions: Array<keyof Organisation>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<IOrganisation | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Organisation, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Organisation).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const updateOrganisationREPO = (
  queryParams: Partial<IOrganisation>,
  updateFields: Partial<IOrganisation>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(Organisation, queryParams, updateFields) : getRepository(Organisation).update(queryParams, updateFields);
};

export const getOrganisationesREPO = (
  queryParam:
    | Partial<IOrganisation>
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }
    | any,
  selectOptions: Array<keyof Organisation>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<IOrganisation[]> => {
  return t
    ? t.manager.find(Organisation, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Organisation).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};
