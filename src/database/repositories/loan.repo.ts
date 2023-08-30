/* eslint-disable lines-between-class-members */
import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import randomstring from 'randomstring';
import { Loan } from '../models/loan.model';
import { ILoan } from '../modelInterfaces';

type QueryParam = Partial<ILoan> | any;
type SelectOptions = Array<keyof ILoan>;
type RelationOptions = any[];
type Transaction = QueryRunner | undefined;

class LoansQueryBuilder {
  private queryParam: QueryParam = {};
  private selectOptions: SelectOptions = [];
  private relationOptions: RelationOptions = [];

  where(queryParam: QueryParam): LoansQueryBuilder {
    this.queryParam = queryParam;
    return this;
  }

  select(...selectOptions: SelectOptions): LoansQueryBuilder {
    this.selectOptions = selectOptions;
    return this;
  }

  relations(...relationOptions: RelationOptions): LoansQueryBuilder {
    this.relationOptions = relationOptions;
    return this;
  }

  build(): [QueryParam, SelectOptions, RelationOptions] {
    return [this.queryParam, this.selectOptions, this.relationOptions];
  }
}

const Repository = {
  LoansQueryBuilder,
  getLoan(queryParam: QueryParam, selectOptions: SelectOptions, relationOptions: RelationOptions, t?: Transaction): Promise<Loan | undefined> {
    const repository = t ? t.manager.getRepository(Loan) : getRepository(Loan);
    return repository.findOne({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  listLoans(queryParam: QueryParam, selectOptions: SelectOptions, relationOptions: RelationOptions, t?: Transaction): Promise<Loan[]> {
    const repository = t ? t.manager.getRepository(Loan) : getRepository(Loan);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  createLoan(queryParams: Partial<Loan> | Partial<Loan>[] | any, t?: Transaction): Promise<any> {
    const repository = t ? t.manager.getRepository(Loan) : getRepository(Loan);
    const payload = {
      code: `lon_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
      ...queryParams,
    };
    return repository.save(payload);
  },

  updateLoan(queryParams: Partial<Loan>, updateFields: QueryParam, t?: Transaction): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(Loan) : getRepository(Loan);
    return repository.update(queryParams, updateFields);
  },
};

export default Repository;
