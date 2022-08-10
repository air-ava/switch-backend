import { QueryRunner, getRepository, In } from 'typeorm';
import { IUser } from '../modelInterfaces';
import { Users } from '../models/users.model';

export const findUser = async (queryParam: Partial<IUser | any>, selectOptions: Array<keyof Users>, t?: QueryRunner): Promise<Users | undefined> => {
  return t
    ? t.manager.findOne(Users, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Users).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      });
};
