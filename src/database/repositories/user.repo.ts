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

export const createAUser = async (payload: {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  code?: string;
  phone?: string;
  user_type: string;
  business_name: string;
  remember_token: string;
  country: string;

  phone_number: number;
  // is_business: boolean;
  t?: QueryRunner;
}): Promise<InsertResult> => {
  console.log({ payload });
  const { t, ...rest } = payload;
  return t ? t.manager.insert(Users, rest) : getRepository(Users).insert(rest);
};

export const updateUser = (queryParams: Pick<IUser, 'id'>, updateFields: Partial<IUser>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Users, queryParams, updateFields) : getRepository(Users).update(queryParams, updateFields);
};

export const verifyUser = (
  queryParams: Pick<IUser, 'id' | 'remember_token'>,
  updateFields: Partial<IUser>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(Users, queryParams, updateFields) : getRepository(Users).update(queryParams, updateFields);
};
