import { QueryRunner, getRepository, InsertResult, UpdateResult } from 'typeorm';
import { IPhoneNumber } from '../modelInterfaces';
import { PhoneNumbers } from '../models/phoneNumber.model';

type QueryParam = Partial<IPhoneNumber> | any;
type SelectOptions = Array<keyof IPhoneNumber>;
type RelationOptions = any[];
type Transaction = QueryRunner | undefined;

export const getOnePhoneNumber = async ({
  queryParams,
  selectOptions = [],
  transaction,
}: {
  queryParams: QueryParam;
  selectOptions?: SelectOptions;
  transaction?: QueryRunner;
}): Promise<PhoneNumbers | undefined> => {
  const repository = transaction ? transaction.manager.getRepository(PhoneNumbers) : getRepository(PhoneNumbers);
  return repository.findOne({
    where: queryParams,
    ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
  });
};

export const createAPhoneNumber = async ({
  queryParams,
  transaction,
}: {
  queryParams: Partial<IPhoneNumber>;
  transaction?: QueryRunner;
}): Promise<InsertResult> => {
  const repository = transaction ? transaction.manager.getRepository(PhoneNumbers) : getRepository(PhoneNumbers);
  return repository.insert(queryParams);
};

export const updatePhoneNumber = (
  queryParams: Pick<IPhoneNumber, 'id'>,
  updateFields: Partial<IPhoneNumber>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  const repository = t ? t.manager.getRepository(PhoneNumbers) : getRepository(PhoneNumbers);
  return repository.update(queryParams, updateFields);
};
