import { QueryRunner, InsertResult, getRepository } from 'typeorm';
import { ILink } from '../modelInterfaces';
import { Link } from '../models/link.model';

export const createLinkREPO = (queryParams: Partial<ILink>, transaction?: QueryRunner): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Link, queryParams) : getRepository(Link).insert(queryParams);
};

export const saveLinkREPO = (queryParams: Partial<ILink>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(Link, queryParams) : getRepository(Link).save(queryParams);
};

export const getOneLinkREPO = (
  queryParam: Partial<ILink> | any,
  selectOptions: Array<keyof Link>,
  transaction?: QueryRunner,
): Promise<ILink | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Link, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Link).findOne({ where: queryParam, ...(selectOptions.length && { select: selectOptions.concat(['id']) }) });
};
