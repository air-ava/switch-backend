import { QueryRunner, getRepository } from 'typeorm';
import { IThirdPartyLogs } from '../modelInterfaces';
import { ThirdPartyLogs } from '../models/thirdParty.model';

export const saveThirdPartyLogsREPO = (queryParams: Partial<IThirdPartyLogs>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(ThirdPartyLogs, queryParams) : getRepository(ThirdPartyLogs).save(queryParams);
};
