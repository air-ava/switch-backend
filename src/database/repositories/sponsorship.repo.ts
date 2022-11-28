import { QueryRunner, getRepository, In } from 'typeorm';
import { ISponsorships } from '../modelInterfaces';
import { Sponsorships } from '../models/sponsorships.model';

export const findSponsorships = async (
  queryParam: Partial<ISponsorships> | any,
  selectOptions: Array<keyof Sponsorships>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Sponsorships | undefined> => {
  return t
    ? t.manager.findOne(Sponsorships, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Sponsorships).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const findMultipleSponsorshipss = async (
  queryParam: Partial<ISponsorships> | any,
  selectOptions: Array<keyof Sponsorships>,
  relationOptions?: any[],

  t?: QueryRunner,
): Promise<Sponsorships[]> => {
  return t
    ? t.manager.find(Sponsorships, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Sponsorships).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveSponsorshipsREPO = (queryParams: Partial<ISponsorships>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(Sponsorships, queryParams) : getRepository(Sponsorships).save(queryParams);
};
