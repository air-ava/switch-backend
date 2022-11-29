import { QueryRunner, getRepository } from 'typeorm';
import { ISettings } from '../modelInterfaces';
import { Settings } from '../models/settings.model';

export const getOneSettingsREPO = (
  queryParam: Partial<ISettings> | any,
  selectOptions: Array<keyof Settings>,
  transaction?: QueryRunner,
): Promise<ISettings | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Settings, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Settings).findOne({ where: queryParam, ...(selectOptions.length && { select: selectOptions.concat(['id']) }) });
};
