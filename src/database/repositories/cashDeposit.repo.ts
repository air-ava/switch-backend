import { EntityRepository, QueryRunner, getRepository, UpdateResult } from 'typeorm';
import randomstring from 'randomstring';
import { CashDeposit } from '../models/cashDeposit.model';
import { ICashDeposit } from '../modelInterfaces';

type QueryParam = Partial<ICashDeposit> | any;
type SelectOptions = Array<keyof ICashDeposit>;
type RelationOptions = any[];
type Transaction = QueryRunner | undefined;

const CashDepositRepository = {
  async getCashDeposit(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<CashDeposit | undefined> {
    const repository = t ? t.manager.getRepository(CashDeposit) : getRepository(CashDeposit);
    return repository.findOne({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async listCashDeposits(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<CashDeposit[] | any[]> {
    const repository = t ? t.manager.getRepository(CashDeposit) : getRepository(CashDeposit);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async createCashDeposit(queryParams: Partial<CashDeposit> | Partial<CashDeposit>[] | any, t?: Transaction): Promise<CashDeposit> {
    const repository = t ? t.manager.getRepository(CashDeposit) : getRepository(CashDeposit);
    const payload = {
      code: `csd_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
      ...queryParams,
    };
    return repository.save(payload);
  },

  async updateCashDeposit(queryParams: Partial<CashDeposit>, updateFields: QueryParam, t?: Transaction): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(CashDeposit) : getRepository(CashDeposit);
    return repository.update(queryParams, updateFields);
  },
};

export default CashDepositRepository;
