import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, InsertResult, UpdateResult, FindConditions } from 'typeorm';
import { IIndividual, IUser } from '../modelInterfaces';
import { Users } from '../models/users.model';
import { Individual } from '../models/individual.model';

export const findIndividual = async (
  queryParam: Partial<IIndividual | IIndividual[] | any>,
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

export const listDirectors = async (
  queryParam: Partial<IIndividual | any>,
  selectOptions: Array<keyof Individual>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Individual[] | any[]> => {
  const repository = t ? t.manager.getRepository(Individual) : getRepository(Individual);

  const modifiedQueryParam = {
    ...queryParam,
    type: In(['director', 'shareholder']),
  };
  return repository.find({
    where: modifiedQueryParam,
    ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
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
  const payload = {
    code: `ind_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return t ? t.manager.save(Individual, payload) : getRepository(Individual).save(payload);
};

export const updateIndividual = (queryParams: Partial<IIndividual>, updateFields: Partial<IIndividual>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Individual, queryParams, updateFields) : getRepository(Individual).update(queryParams, updateFields);
};

export const findOrCreateIndividual = async (queryParams: Partial<IIndividual>, t?: QueryRunner): Promise<Individual> => {
  // If a transaction (t) is provided, we'll use it; otherwise, use the default query runner
  const queryRunner = t ? t.manager.getRepository(Individual) : getRepository(Individual);

  // Extract the relevant keys (phone_number and email) from queryParams
  const { phone_number, email } = queryParams;

  // Prepare the find conditions based on the extracted keys
  const findConditions: FindConditions<IIndividual> = {};
  if (phone_number) findConditions.phone_number = phone_number;
  if (email) findConditions.email = email;

  // Attempt to find an existing individual based on the provided queryParams
  const existingIndividual = await queryRunner.findOne(queryParams);

  // If an existing individual is found, return it
  if (existingIndividual) return existingIndividual;

  // If no existing individual is found, create a new one and save it
  const payload = {
    code: `ind_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return queryRunner.save(payload);
};
