import { QueryRunner, InsertResult, getRepository } from 'typeorm';
import { ISocial } from '../modelInterfaces';
import { Social } from '../models/social.model';

export const createSocialREPO = (queryParams: Partial<ISocial>, transaction?: QueryRunner): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Social, queryParams) : getRepository(Social).insert(queryParams);
};

export const saveSocialREPO = (queryParams: Partial<ISocial>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(Social, queryParams) : getRepository(Social).save(queryParams);
};

export const getOneSocialREPO = (
  queryParam: Partial<ISocial> | any,
  selectOptions: Array<keyof Social>,
  transaction?: QueryRunner,
): Promise<ISocial | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Social, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Social).findOne({ where: queryParam, ...(selectOptions.length && { select: selectOptions.concat(['id']) }) });
};
