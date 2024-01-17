import { EntityRepository, QueryRunner, getRepository, UpdateResult } from 'typeorm';
import randomstring from 'randomstring';
import { CashDepositLog } from '../models/cashDepositLog.model';
import { ICashDepositLog } from '../modelInterfaces';

type QueryParam = Partial<ICashDepositLog> | any;
type SelectOptions = Array<keyof ICashDepositLog>;
type RelationOptions = any[];
type Transaction = QueryRunner | undefined;

const CashDepositLogRepository = {
  async getCashDepositLog(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<CashDepositLog | undefined> {
    const repository = t ? t.manager.getRepository(CashDepositLog) : getRepository(CashDepositLog);
    return repository.findOne({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async listCashDepositLogs(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<CashDepositLog[] | any[]> {
    const repository = t ? t.manager.getRepository(CashDepositLog) : getRepository(CashDepositLog);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async createCashDepositLog(queryParams: Partial<CashDepositLog> | Partial<CashDepositLog>[] | any, t?: Transaction): Promise<CashDepositLog> {
    const repository = t ? t.manager.getRepository(CashDepositLog) : getRepository(CashDepositLog);
    const payload = {
      code: `cdl_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
      ...queryParams,
    };
    return repository.save(payload);
  },

  async updateCashDepositLog(queryParams: Partial<CashDepositLog>, updateFields: QueryParam, t?: Transaction): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(CashDepositLog) : getRepository(CashDepositLog);
    return repository.update(queryParams, updateFields);
  },
};

export default CashDepositLogRepository;
