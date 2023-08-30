/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable lines-between-class-members */
import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import randomstring from 'randomstring';
import { LoanActivity } from '../models/loanActivity.model';
import { ILoanActivity } from '../modelInterfaces';
import Utils from '../../utils/utils';

type QueryParam = Partial<ILoanActivity> | any;
type SelectOptions = Array<keyof ILoanActivity>;
type RelationOptions = any[];
type Transaction = QueryRunner | undefined;

class LoanActivitiesQueryBuilder {
  private queryParam: QueryParam = {};
  private selectOptions: SelectOptions = [];
  private relationOptions: RelationOptions = [];
  private page = 1;
  private from?: any;
  private offset?: any;
  private query?: any;
  private to?: any;
  private perPage = 20;
  private order: any = { created_at: 'DESC' };

  where(queryParam: QueryParam): LoanActivitiesQueryBuilder {
    this.queryParam = queryParam;
    return this;
  }

  select(...selectOptions: SelectOptions): LoanActivitiesQueryBuilder {
    this.selectOptions = selectOptions;
    return this;
  }

  relations(...relationOptions: RelationOptions): LoanActivitiesQueryBuilder {
    this.relationOptions = relationOptions;
    return this;
  }

  setPage(page: number): LoanActivitiesQueryBuilder {
    this.page = page;
    return this;
  }

  setFrom(from: any): LoanActivitiesQueryBuilder {
    this.from = from;
    return this;
  }

  setTo(to: any): LoanActivitiesQueryBuilder {
    this.to = to;
    return this;
  }

  setPerPage(perPage: number): LoanActivitiesQueryBuilder {
    this.perPage = perPage;
    return this;
  }

  setOrder(order: any): LoanActivitiesQueryBuilder {
    this.order = order;
    return this;
  }

  paginationMetaOffset(): any {
    const { page, from, to, perPage, queryParam } = this;
    const { offset, query } = Utils.paginationMetaOffset({ page, from, to, perPage, query: queryParam });
    this.offset = offset;
    this.query = query;
    return this;
  }

  //   paginationMetaCursor(data: any): any {
  //     Utils.paginationMetaCursor(this);
  //     return this;
  //   }

  build(): any {
    return {
      queryParam: this.queryParam && this.queryParam,
      selectOptions: this.selectOptions && this.selectOptions,
      relationOptions: this.relationOptions && this.relationOptions,
      page: this.page && this.page,
      from: this.from && this.from,
      to: this.to && this.to,
      perPage: this.perPage && this.perPage,
      query: this.query && this.query,
      offset: this.offset && this.offset,
      order: this.order && this.order,
    };
  }
}

const Repository = {
  LoanActivitiesQueryBuilder,
  getLoanActivity(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions: RelationOptions,
    t?: Transaction,
  ): Promise<LoanActivity | undefined> {
    const repository = t ? t.manager.getRepository(LoanActivity) : getRepository(LoanActivity);
    return repository.findOne({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  listLoanActivities(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions: RelationOptions,
    t?: Transaction,
  ): Promise<LoanActivity[]> {
    const repository = t ? t.manager.getRepository(LoanActivity) : getRepository(LoanActivity);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  createLoanActivity(queryParams: Partial<LoanActivity> | Partial<LoanActivity>[] | any, t?: Transaction): Promise<any> {
    const repository = t ? t.manager.getRepository(LoanActivity) : getRepository(LoanActivity);
    const payload = {
      code: `lonAct_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
      ...queryParams,
    };
    return repository.save(payload);
  },

  updateLoanActivity(queryParams: Partial<LoanActivity>, updateFields: QueryParam, t?: Transaction): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(LoanActivity) : getRepository(LoanActivity);
    return repository.update(queryParams, updateFields);
  },
};

export default Repository;
