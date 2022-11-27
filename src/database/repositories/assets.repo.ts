import { QueryRunner, InsertResult, getRepository } from 'typeorm';
import { IAssets } from '../modelInterfaces';
import { Assets } from '../models/assets.model';

export const createAssetsREPO = (queryParams: Partial<IAssets>, transaction?: QueryRunner): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Assets, queryParams) : getRepository(Assets).insert(queryParams);
};

export const saveAssetsREPO = (queryParams: Partial<IAssets>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(Assets, queryParams) : getRepository(Assets).save(queryParams);
};

export const getOneAssetsREPO = (
  queryParam: Partial<IAssets>,
  selectOptions: Array<keyof Assets>,
  transaction?: QueryRunner,
): Promise<IAssets | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Assets, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Assets).findOne({ where: queryParam, ...(selectOptions.length && { select: selectOptions.concat(['id']) }) });
};
