/* eslint-disable no-restricted-syntax */
import { QueryRunner, getRepository, In, InsertResult, UpdateResult } from 'typeorm';
import { IUser } from '../modelInterfaces';
import { Users } from '../models/users.model';

export const findUser = async (
  queryParam: Partial<IUser | any>,
  selectOptions: Array<keyof Users>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Users | undefined> => {
  return t
    ? t.manager.findOne(Users, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Users).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        // relations: ['phone'],
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listUser = async (
  queryParam: Partial<IUser> | Partial<IUser>[] | any,
  selectOptions: Array<keyof Users>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Users[]> => {
  const response =  t
    ? t.manager.find(Users, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
        order: { created_at: 'DESC' },
      })
    : await getRepository(Users).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
        order: { created_at: 'DESC' },
      });
  return response;
};

export const createAUser = async (payload: {
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
  console.log({ payload });
  const { t, ...rest } = payload;
  return t ? t.manager.insert(Users, rest) : getRepository(Users).insert(rest);
};

export const saveAUser = async (payload: Partial<IUser> | Partial<IUser>[] | any, t?: QueryRunner): Promise<Users> => {
  const { ...rest } = payload;
  return t ? t.manager.save(Users, rest) : getRepository(Users).save(Array.isArray(payload) ? payload : rest);
};

export const updateUser = (queryParams: Partial<IUser>, updateFields: Partial<IUser>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Users, queryParams, updateFields) : getRepository(Users).update(queryParams, updateFields);
};

export const verifyUser = (queryParams: Partial<IUser>, updateFields: Partial<IUser>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Users, queryParams, updateFields) : getRepository(Users).update(queryParams, updateFields);
};
