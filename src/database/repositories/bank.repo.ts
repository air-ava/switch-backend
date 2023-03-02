import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { IBanks } from '../modelInterfaces';
import { Banks } from '../models/banks.model';
import { STATUSES } from '../models/status.model';

const Repo = {
  async findBank(
    queryParam: Partial<IBanks | any>,
    selectOptions: Array<keyof Banks>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<Banks | undefined | any> {
    return t
      ? t.manager.findOne(Banks, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(Banks).findOne({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },
  
  async findDefaultBank(
    queryParam: Partial<IBanks | any>,
    selectOptions: Array<keyof Banks>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<Banks | undefined | any> {
    return t
      ? t.manager.findOne(Banks, {
          where: { ...queryParam, status: STATUSES.ACTIVE, default: true },
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(Banks).findOne({
          where: { ...queryParam, status: STATUSES.ACTIVE, default: true },
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },

  async findBanks(queryParam: Partial<IBanks | any>, selectOptions: Array<keyof Banks>, relationOptions?: any[], t?: QueryRunner): Promise<Banks[]> {
    return t
      ? t.manager.find(Banks, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(Banks).find({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },

  saveBank(queryParams: Partial<IBanks>, transaction?: QueryRunner): Promise<any> {
    return transaction ? transaction.manager.save(Banks, queryParams) : getRepository(Banks).save(queryParams);
  },

  updateBank(queryParams: Pick<IBanks, 'id'>, updateFields: Partial<IBanks>, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.update(Banks, queryParams, updateFields) : getRepository(Banks).update(queryParams, updateFields);
  },

  defaultBank(queryParams: Pick<IBanks, 'id'>, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.update(Banks, queryParams, { default: true }) : getRepository(Banks).update(queryParams, { default: true });
  },

  unDefaultBank(queryParams: Pick<IBanks, 'id'>, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.update(Banks, queryParams, { default: false }) : getRepository(Banks).update(queryParams, { default: false });
  },
};

export default Repo;
