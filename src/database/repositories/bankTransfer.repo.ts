import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { IBanks, IBankTransfers } from '../modelInterfaces';
import { Banks } from '../models/banks.model';
import { BankTransfers } from '../models/bankTransfer.model';
import { STATUSES } from '../models/status.model';

const Repo = {
  async findBankTransfer(
    queryParam: Partial<IBankTransfers | any>,
    selectOptions: Array<keyof BankTransfers>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<BankTransfers | undefined | any> {
    return t
      ? t.manager.findOne(BankTransfers, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(BankTransfers).findOne({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },

  async findBankTransfers(
    queryParam: Partial<IBankTransfers | any>,
    selectOptions: Array<keyof BankTransfers>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<BankTransfers[]> {
    return t
      ? t.manager.find(BankTransfers, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
          order: { created_at: 'DESC' },
        })
      : getRepository(BankTransfers).find({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
          order: { created_at: 'DESC' },
        });
  },

  saveBankTransfer(queryParams: Partial<IBankTransfers>, transaction?: QueryRunner): Promise<any> {
    return transaction ? transaction.manager.save(BankTransfers, queryParams) : getRepository(BankTransfers).save(queryParams);
  },

  updateBankTransfer(queryParams: Partial<IBankTransfers>, updateFields: Partial<IBankTransfers>, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.update(BankTransfers, queryParams, updateFields) : getRepository(BankTransfers).update(queryParams, updateFields);
  },
};

export default Repo;
