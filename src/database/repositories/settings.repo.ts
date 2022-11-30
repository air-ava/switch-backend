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

export const findSettingsREPO = async (
  queryParam: Partial<ISettings> | any,
  selectOptions: Array<keyof Settings>,
  relationOptions?: any[],

  t?: QueryRunner,
): Promise<Settings[]> => {
  return t
    ? t.manager.find(Settings, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Settings).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};
