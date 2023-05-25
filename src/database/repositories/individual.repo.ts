import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, InsertResult, UpdateResult } from 'typeorm';
import { IIndividual, IUser } from '../modelInterfaces';
import { Users } from '../models/users.model';
import { Individual } from '../models/individual.model';

export const findIndividual = async (
  queryParam: Partial<IIndividual | any>,
  selectOptions: Array<keyof Individual>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Individual | undefined> => {
  return t
    ? t.manager.findOne(Individual, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Individual).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        // relations: ['phone'],
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const createIndividual = async (payload: {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  code?: string;
  phone?: string;
  user_type: string;
  business_name?: string;
  remember_token?: string;
  organisation_email?: string;
  country?: string;
  organisation?: number;
  phone_number: number;
  // is_business: boolean;
  t?: QueryRunner;
}): Promise<InsertResult> => {
  const { t, ...rest } = payload;
  return t ? t.manager.insert(Individual, rest) : getRepository(Individual).insert(rest);
};

export const saveIndividual = async (queryParams: Partial<IIndividual>, t?: QueryRunner): Promise<Individual> => {
  // const { ...rest } = payload;
  const payload = {
    code: `ind_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return t ? t.manager.save(Individual, payload) : getRepository(Individual).save(payload);
};

export const updateIndividual = (queryParams: Partial<IIndividual>, updateFields: Partial<IIndividual>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Individual, queryParams, updateFields) : getRepository(Individual).update(queryParams, updateFields);
};
