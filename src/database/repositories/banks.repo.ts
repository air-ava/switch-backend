import { EntityRepository, getRepository, Repository, UpdateResult } from 'typeorm';
import { Banks } from '../models/banks.model';
import { IBanks } from '../modelInterfaces';

type QueryParam = Partial<IBanks> | any;
type SelectOptions = Array<keyof IBanks>;
type RelationOptions = any[];
type Transaction = undefined | any;

const BankRepository = {
  async getBank(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<Banks | undefined> {
    const repository = t ? t.manager.getRepository(Banks) : getRepository(Banks);
    return repository.findOne({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async listBanks(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<Banks[] | any[]> {
    const repository = t ? t.manager.getRepository(Banks) : getRepository(Banks);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async createBank(queryParams: Partial<Banks>, t?: Transaction): Promise<Banks> {
    const repository = t ? t.manager.getRepository(Banks) : getRepository(Banks);
    return repository.save(queryParams);
  },

  async updateBank(queryParams: Partial<Banks>, updateFields: QueryParam, t?: Transaction): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(Banks) : getRepository(Banks);
    return repository.update(queryParams, updateFields);
  },
};

export default BankRepository;
