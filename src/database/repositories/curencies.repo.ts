import { QueryRunner, getRepository, In } from 'typeorm';
import { ICurrency } from '../modelInterfaces';
import { Currency } from '../models/currencies.model';

export const findCurrency = async (
  queryParam: Partial<ICurrency> | any,
  selectOptions: Array<keyof Currency>,
  t?: QueryRunner,
): Promise<Currency | undefined> => {
  return t
    ? t.manager.findOne(Currency, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Currency).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      });
};

export const findMultipleCurrencies = async (
  queryParam: Partial<ICurrency> | any,
  selectOptions: Array<keyof Currency>,
  relationOptions?: any[],

  t?: QueryRunner,
): Promise<Currency[]> => {
  return t
    ? t.manager.find(Currency, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Currency).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};
