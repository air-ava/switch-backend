import { QueryRunner, InsertResult, getRepository } from 'typeorm';
import { IJobTitle } from '../modelInterfaces';
import { JobTitle } from '../models/jobTitle.model';

export const listJobTitleREPO = (
  queryParam: Partial<IJobTitle>,
  selectOptions: Array<keyof JobTitle>,
  transaction?: QueryRunner,
): Promise<IJobTitle | undefined | any> => {
  return transaction
    ? transaction.manager.find(JobTitle, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(JobTitle).find({ where: queryParam, ...(selectOptions.length && { select: selectOptions.concat(['id']) }) });
};
