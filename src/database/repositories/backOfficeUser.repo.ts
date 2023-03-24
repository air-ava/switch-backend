import { getRepository, QueryRunner, UpdateResult } from 'typeorm';
import { IBackOfficeUsers } from '../modelInterfaces';
import { BackOfficeUsers } from '../models/backOfficeUser.model';

const Repo = {
  async findBackOfficeUser(
    queryParam: Partial<IBackOfficeUsers | any>,
    selectOptions: Array<keyof BackOfficeUsers>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<BackOfficeUsers | undefined> {
    return t
      ? t.manager.findOne(BackOfficeUsers, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(BackOfficeUsers).findOne({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          // relations: ['phone'],
          ...(relationOptions && { relations: relationOptions }),
        });
  },

  async saveABackOfficeUser(payload: Partial<IBackOfficeUsers>, t?: QueryRunner): Promise<BackOfficeUsers> {
    const { ...rest } = payload;
    return t ? t.manager.save(BackOfficeUsers, rest) : getRepository(BackOfficeUsers).save(rest);
  },

  async updateBackOfficeUser(
    queryParams: Pick<IBackOfficeUsers, 'id'>,
    updateFields: Partial<IBackOfficeUsers>,
    t?: QueryRunner,
  ): Promise<UpdateResult> {
    return t ? t.manager.update(BackOfficeUsers, queryParams, updateFields) : getRepository(BackOfficeUsers).update(queryParams, updateFields);
  },

  async verifyBackOfficeUser(
    queryParams: Partial<IBackOfficeUsers>,
    updateFields: Partial<IBackOfficeUsers>,
    t?: QueryRunner,
  ): Promise<UpdateResult> {
    return t ? t.manager.update(BackOfficeUsers, queryParams, updateFields) : getRepository(BackOfficeUsers).update(queryParams, updateFields);
  },
};

export default Repo;
