import { QueryRunner, getRepository, In } from 'typeorm';
import { ISponsorshipConditions } from '../modelInterfaces';
import { SponsorshipConditions } from '../models/sponsorshipConditions.model';

export const findSponsorshipConditions = async (
  queryParam: Partial<ISponsorshipConditions> | any,
  selectOptions: Array<keyof SponsorshipConditions>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<SponsorshipConditions | undefined> => {
  return t
    ? t.manager.findOne(SponsorshipConditions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(SponsorshipConditions).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const findMultipleSponsorshipConditionss = async (
  queryParam: Partial<ISponsorshipConditions> | any,
  selectOptions: Array<keyof SponsorshipConditions>,
  relationOptions?: any[],

  t?: QueryRunner,
): Promise<SponsorshipConditions[]> => {
  return t
    ? t.manager.find(SponsorshipConditions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(SponsorshipConditions).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveSponsorshipConditionsREPO = (queryParams: Partial<ISponsorshipConditions>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(SponsorshipConditions, queryParams) : getRepository(SponsorshipConditions).save(queryParams);
};
