import { EntityRepository, QueryRunner, getRepository, UpdateResult } from 'typeorm';
import randomstring from 'randomstring';
import { CashDeposit } from '../models/cashDeposit.model';
import { ICashDeposit } from '../modelInterfaces';
import Utils, { isValidDate, singleDayStartAndEnd } from '../../utils/utils';

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

  async getAllCashDeposits(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<CashDeposit[] | any> {
    const { page = 1, perPage = 20, from, to, ...rest } = queryParam;

    const { offset, query } = Utils.paginationRangeAndOffset({ page, from, to, perPage, query: rest });
    const order: any = { created_at: 'DESC' };

    const repository = t ? t.manager.getRepository(CashDeposit) : getRepository(CashDeposit);
    const [cashDeposits, total] = await Promise.all([
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
      cashDeposits,
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

  async getSummedAmountsByCurrency(
    codes: string[],
    currency: string,
  ): Promise<
    {
      currency: string;
      total_amount: number;
    }[]
  > {
    const repository = getRepository(CashDeposit);

    const sums = await repository
      .createQueryBuilder('cash_deposit')
      .select('cash_deposit.currency')
      .addSelect('SUM(cash_deposit.amount)', 'total_amount')
      .where('cash_deposit.code IN (:...codes)', { codes })
      .andWhere('cash_deposit.currency = :currency', { currency })
      .groupBy('cash_deposit.currency')
      .getRawMany();

    return sums;
  },
};

export default CashDepositRepository;
