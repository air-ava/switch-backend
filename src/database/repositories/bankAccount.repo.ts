import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { IBankAccounts } from '../modelInterfaces';
import { BankAccounts } from '../models/bankAccount.model';
import { STATUSES } from '../models/status.model';

const Repo = {
  async findBank(
    queryParam: Partial<IBankAccounts | any>,
    selectOptions: Array<keyof BankAccounts>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<BankAccounts | undefined | any> {
    return t
      ? t.manager.findOne(BankAccounts, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(BankAccounts).findOne({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },
  
  async findDefaultBank(
    queryParam: Partial<IBankAccounts | any>,
    selectOptions: Array<keyof BankAccounts>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<BankAccounts | undefined | any> {
    return t
      ? t.manager.findOne(BankAccounts, {
          where: { ...queryParam, status: STATUSES.ACTIVE, default: true },
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(BankAccounts).findOne({
          where: { ...queryParam, status: STATUSES.ACTIVE, default: true },
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },

  async findBanks(
    queryParam: Partial<IBankAccounts | any>,
    selectOptions: Array<keyof BankAccounts>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<BankAccounts[]> {
    return t
      ? t.manager.find(BankAccounts, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(BankAccounts).find({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },

  saveBank(queryParams: Partial<IBankAccounts>, transaction?: QueryRunner): Promise<any> {
    return transaction ? transaction.manager.save(BankAccounts, queryParams) : getRepository(BankAccounts).save(queryParams);
  },

  updateBank(queryParams: Pick<IBankAccounts, 'id'>, updateFields: Partial<IBankAccounts>, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.update(BankAccounts, queryParams, updateFields) : getRepository(BankAccounts).update(queryParams, updateFields);
  },

  defaultBank(queryParams: Pick<IBankAccounts, 'id'>, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.update(BankAccounts, queryParams, { default: true }) : getRepository(BankAccounts).update(queryParams, { default: true });
  },

  unDefaultBank(queryParams: Pick<IBankAccounts, 'id'>, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.update(BankAccounts, queryParams, { default: false }) : getRepository(BankAccounts).update(queryParams, { default: false });
  },
};

export default Repo;
