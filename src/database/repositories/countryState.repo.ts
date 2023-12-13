import { EntityRepository, QueryRunner, getRepository, UpdateResult, FindConditions } from 'typeorm';
import { CountryState } from '../models/countryStates.model';
import { ICountryState } from '../modelInterfaces';

type QueryParam = Partial<ICountryState> | any;
type SelectOptions = Array<keyof ICountryState>;
type RelationOptions = any[];
type Transaction = QueryRunner | undefined;

const CountryStateRepository = {
  async getCountryState(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<CountryState | undefined> {
    const repository = t ? t.manager.getRepository(CountryState) : getRepository(CountryState);
    return repository.findOne({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async listCountryStates(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<CountryState[] | any[]> {
    const repository = t ? t.manager.getRepository(CountryState) : getRepository(CountryState);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async createCountryState(queryParams: Partial<CountryState> | Partial<CountryState>[] | any, t?: Transaction): Promise<CountryState> {
    const repository = t ? t.manager.getRepository(CountryState) : getRepository(CountryState);
    const payload = {
      ...queryParams,
    };
    return repository.save(payload);
  },

  async findOrCreateCountryState(queryParams: Partial<CountryState> | Partial<CountryState>[] | any, t?: Transaction): Promise<CountryState> {
    const repository = t ? t.manager.getRepository(CountryState) : getRepository(CountryState);

    const findConditions: FindConditions<ICountryState> = { ...queryParams };

    const existingCountryState = await repository.findOne({ where: findConditions });
    if (existingCountryState) return existingCountryState;

    const payload = {
      ...queryParams,
    };
    return repository.save(payload);
  },

  async updateCountryState(queryParams: Partial<CountryState>, updateFields: QueryParam, t?: Transaction): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(CountryState) : getRepository(CountryState);
    return repository.update(queryParams, updateFields);
  },
};

export default CountryStateRepository;
