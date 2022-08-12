import { QueryRunner, getRepository, In, InsertResult } from 'typeorm';
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
  phone_number: number;
  is_business: boolean;
  t?: QueryRunner;
}): Promise<InsertResult> => {
  console.log({ payload });
  const { t, ...rest } = payload;
  return t ? t.manager.insert(Users, rest) : getRepository(Users).insert(rest);
};
