import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { IBackOfficeBanks } from '../modelInterfaces';
import { BackOfficeBanks } from '../models/backOfficeBanks.model';
import { STATUSES } from '../models/status.model';

const Repo = {
  async findBackOfficeBank(
    queryParam: Partial<IBackOfficeBanks | any>,
    selectOptions: Array<keyof BackOfficeBanks>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<BackOfficeBanks | undefined | any> {
    return t
      ? t.manager.findOne(BackOfficeBanks, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(BackOfficeBanks).findOne({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },

  async findDefaultBackOfficeBank(
    queryParam: Partial<IBackOfficeBanks | any>,
    selectOptions: Array<keyof BackOfficeBanks>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<BackOfficeBanks | undefined | any> {
    return t
      ? t.manager.findOne(BackOfficeBanks, {
          where: { ...queryParam, status: STATUSES.ACTIVE, default: true },
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(BackOfficeBanks).findOne({
          where: { ...queryParam, status: STATUSES.ACTIVE, default: true },
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },

  async findBackOfficeBanks(
    queryParam: Partial<IBackOfficeBanks | any>,
    selectOptions: Array<keyof BackOfficeBanks>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<BackOfficeBanks[]> {
    return t
      ? t.manager.find(BackOfficeBanks, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(BackOfficeBanks).find({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },

  saveBackOfficeBank(queryParams: Partial<IBackOfficeBanks>, transaction?: QueryRunner): Promise<any> {
    return transaction ? transaction.manager.save(BackOfficeBanks, queryParams) : getRepository(BackOfficeBanks).save(queryParams);
  },

  updateBackOfficeBank(queryParams: Pick<IBackOfficeBanks, 'id'>, updateFields: Partial<IBackOfficeBanks>, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.update(BackOfficeBanks, queryParams, updateFields) : getRepository(BackOfficeBanks).update(queryParams, updateFields);
  },
};

export default Repo;
