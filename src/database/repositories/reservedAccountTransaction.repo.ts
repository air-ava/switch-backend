import { QueryRunner, getRepository, UpdateResult, InsertResult } from 'typeorm';
import randomstring from 'randomstring';
import Utils from '../../utils/utils';
import { ReservedAccountsTransaction } from '../models/reservedAccountTransaction.model';
import { IReservedAccountsTransaction } from '../modelInterfaces';

type QueryParam = Partial<IReservedAccountsTransaction> | any;
type SelectOptions = Array<keyof IReservedAccountsTransaction>;
type RelationOptions = any[];
type Transaction = QueryRunner | undefined;

const ReservedAccountsTransactionRepository = {
  async getReservedAccountTransaction(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<ReservedAccountsTransaction | undefined> {
    const repository = t ? t.manager.getRepository(ReservedAccountsTransaction) : getRepository(ReservedAccountsTransaction);
    return repository.findOne({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async listReservedAccountTransactions(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<ReservedAccountsTransaction[] | any[]> {
    const repository = t ? t.manager.getRepository(ReservedAccountsTransaction) : getRepository(ReservedAccountsTransaction);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async getAllReservedAccountTransactions(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<any> {
    const { page = 1, perPage = 20, from, to, ...rest } = queryParam;

    const { offset, query } = Utils.paginationRangeAndOffset({ page, from, to, perPage, query: rest });
    const order: any = { created_at: 'DESC' };

    const repository = t ? t.manager.getRepository(ReservedAccountsTransaction) : getRepository(ReservedAccountsTransaction);
    const [reservedAccountsTransactions, total] = await Promise.all([
      repository.find({
        where: query,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
        order,
        take: parseInt(perPage, 10),
        skip: offset,
      }),
      repository.count({ where: rest }),
    ]);

    const { nextPage, totalPages, hasNextPage, hasPreviousPage } = Utils.paginationMetaOffset({ total, perPage, page });

    return {
      reservedAccountsTransactions,
      meta: {
        total,
        perPage,
        currentPage: page,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        nextPage,
      },
    };
  },

  async createReservedAccountTransaction(
    queryParams: Partial<ReservedAccountsTransaction> | Partial<ReservedAccountsTransaction>[] | any,
    t?: Transaction,
  ): Promise<ReservedAccountsTransaction> {
    const repository = t ? t.manager.getRepository(ReservedAccountsTransaction) : getRepository(ReservedAccountsTransaction);
    const payload = {
      code: `rst_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
      ...queryParams,
    };
    return repository.save(payload);
  },

  async saveReservedAccountTransaction(
    queryParams: Partial<ReservedAccountsTransaction> | Partial<ReservedAccountsTransaction>[] | any,
    t?: Transaction,
  ): Promise<InsertResult> {
    const repository = t ? t.manager.getRepository(ReservedAccountsTransaction) : getRepository(ReservedAccountsTransaction);
    const payload = {
      code: `rst_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
      ...queryParams,
    };
    return repository.insert(payload);
  },

  async updateReservedAccountTransaction(
    queryParams: Partial<ReservedAccountsTransaction>,
    updateFields: QueryParam,
    t?: Transaction,
  ): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(ReservedAccountsTransaction) : getRepository(ReservedAccountsTransaction);
    return repository.update(queryParams, updateFields);
  },
};

export default ReservedAccountsTransactionRepository;
