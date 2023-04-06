import { QueryRunner, getRepository, InsertResult, UpdateResult } from 'typeorm';
import { IPhoneNumber } from '../modelInterfaces';
import { PhoneNumbers } from '../models/phoneNumber.model';

export const getOnePhoneNumber = async ({
  queryParams,
  selectOptions = [],
  transaction,
}: {
  queryParams: Partial<IPhoneNumber | any>;
  selectOptions?: Array<keyof IPhoneNumber>;
  transaction?: QueryRunner;
}): Promise<PhoneNumbers | undefined> => {
  return transaction
    ? transaction.manager.findOne(PhoneNumbers, {
        where: queryParams,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(PhoneNumbers).findOne({
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
  console.log({ queryParams });
  return transaction ? transaction.manager.insert(PhoneNumbers, queryParams) : getRepository(PhoneNumbers).insert(queryParams);
};

export const updatePhoneNumber = (
  queryParams: Pick<IPhoneNumber, 'id'>,
  updateFields: Partial<IPhoneNumber>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(PhoneNumbers, queryParams, updateFields) : getRepository(PhoneNumbers).update(queryParams, updateFields);
};
