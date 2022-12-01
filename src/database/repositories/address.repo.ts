import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { IAddress, IAddresses } from '../modelInterfaces';
import { Addresses } from '../models/address.model';

export const createAddressREPO = (
  queryParams: Omit<IAddress, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  transaction?: QueryRunner,
): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Addresses, queryParams) : getRepository(Addresses).insert(queryParams);
};

export const createAndGetAddressREPO = (queryParams: Partial<IAddresses>, transaction?: QueryRunner): Promise<Addresses> => {
  return transaction ? transaction.manager.save(Addresses, queryParams) : getRepository(Addresses).save(queryParams);
};

export const getOneAddressREPO = (
  queryParam: Partial<IAddresses | any>,
  selectOptions: Array<keyof Addresses>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<IAddresses | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Addresses, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Addresses).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const updateAddressREPO = (
  queryParams: Partial<IAddresses>,
  updateFields: Partial<IAddresses>,
  transaction?: QueryRunner,
): Promise<UpdateResult> => {
  return transaction ? transaction.manager.update(Addresses, queryParams, updateFields) : getRepository(Addresses).update(queryParams, updateFields);
};

export const getAddressesREPO = (
  queryParam: Partial<IAddresses> | any,
  selectOptions: Array<keyof Addresses>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<IAddresses[]> => {
  return transaction
    ? transaction.manager.find(Addresses, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Addresses).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const countAddressesREPO = async (queryParam: Partial<IAddresses>, transaction?: QueryRunner): Promise<number> => {
  return transaction ? transaction.manager.count(Addresses, { where: queryParam }) : getRepository(Addresses).count({ where: queryParam });
};
