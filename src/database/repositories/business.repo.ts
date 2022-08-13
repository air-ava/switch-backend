import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { IBusiness } from '../modelInterfaces';
import { Business } from '../models/business.model';

export const createBusinessREPO = (
  queryParams: Omit<IBusiness, 'id' | 'created_at' | 'updated_at' | 'Owner'>,
  transaction?: QueryRunner,
): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Business, queryParams) : getRepository(Business).insert(queryParams);
};

export const getOneBuinessREPO = (
  queryParam: Partial<IBusiness | any>,
  selectOptions: Array<keyof Business>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<IBusiness | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Business, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Business).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const updateBusinessREPO = (queryParams: Partial<IBusiness>, updateFields: Partial<IBusiness>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Business, queryParams, updateFields) : getRepository(Business).update(queryParams, updateFields);
};

export const getBusinessesREPO = (
  queryParam:
    | Partial<IBusiness>
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }
    | any,
  selectOptions: Array<keyof Business>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<IBusiness[]> => {
  return t
    ? t.manager.find(Business, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Business).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};
