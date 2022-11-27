import { QueryRunner, getRepository, In, InsertResult, UpdateResult } from 'typeorm';
import { IPassword, IUser } from '../modelInterfaces';
import { Password } from '../models/password.model';
import { Users } from '../models/users.model';

export const findPassword = async (
  queryParam: Partial<IPassword | any>,
  selectOptions: Array<keyof Password>,
  t?: QueryRunner,
): Promise<Password | undefined> => {
  return t
    ? t.manager.findOne(Password, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Password).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      });
};

export const findPasswords = async (
  queryParam: Partial<IPassword | any>,
  selectOptions: Array<keyof Password>,
  t?: QueryRunner,
): Promise<IPassword[]> => {
  return t
    ? t.manager.find(Password, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Password).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      });
};

export const createPassword = async (payload: Partial<IPassword>, t?: QueryRunner): Promise<InsertResult> => {
  const { ...rest } = payload;
  return t ? t.manager.insert(Password, rest) : getRepository(Password).insert(rest);
};

export const updatePassword = (queryParams: Partial<IPassword>, updateFields: Partial<IPassword>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Password, queryParams, updateFields) : getRepository(Password).update(queryParams, updateFields);
};

export const verifyUser = (
  queryParams: Pick<IUser, 'id' | 'remember_token'>,
  updateFields: Partial<IUser>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(Users, queryParams, updateFields) : getRepository(Users).update(queryParams, updateFields);
};
