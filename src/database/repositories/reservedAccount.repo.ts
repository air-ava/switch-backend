import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import Utils from '../../utils/utils';
import { IReservedAccount } from '../modelInterfaces';
import { ReservedAccount } from '../models/reservedAccounts.model';

type QueryParam = Partial<IReservedAccount> | any;
type SelectOptions = Array<keyof IReservedAccount>;
type RelationOptions = any[];
type Transaction = QueryRunner | undefined;

const ReservedAccountRepository = {
  async getReservedAccount(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<ReservedAccount | undefined> {
    const repository = t ? t.manager.getRepository(ReservedAccount) : getRepository(ReservedAccount);
    return repository.findOne({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async listReservedAccounts(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<ReservedAccount[] | any[]> {
    const repository = t ? t.manager.getRepository(ReservedAccount) : getRepository(ReservedAccount);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async getAllReservedAccounts(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<any> {
    const { page = 1, perPage = 20, from, to, ...rest } = queryParam;

    const { offset, query } = Utils.paginationRangeAndOffset({ page, from, to, perPage, query: rest });
    const order: any = { created_at: 'DESC' };

    const repository = t ? t.manager.getRepository(ReservedAccount) : getRepository(ReservedAccount);
    const [reservedAccounts, total] = await Promise.all([
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
      reservedAccounts,
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

  async createReservedAccount(queryParams: Partial<ReservedAccount> | Partial<ReservedAccount>[] | any, t?: Transaction): Promise<ReservedAccount> {
    const repository = t ? t.manager.getRepository(ReservedAccount) : getRepository(ReservedAccount);
    return repository.save(queryParams);
  },

  async updateReservedAccount(queryParams: Partial<ReservedAccount>, updateFields: QueryParam, t?: Transaction): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(ReservedAccount) : getRepository(ReservedAccount);
    return repository.update(queryParams, updateFields);
  },
};

export default ReservedAccountRepository;
