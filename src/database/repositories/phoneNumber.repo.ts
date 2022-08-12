import { QueryRunner, getRepository, InsertResult } from 'typeorm';
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
  queryParams: Omit<IPhoneNumber, 'active' | 'is_verified' | 'id' | 'created_at' | 'updated_at'>;
  transaction?: QueryRunner;
}): Promise<InsertResult> => {
  console.log({ queryParams });
  return transaction ? transaction.manager.insert(PhoneNumbers, queryParams) : getRepository(PhoneNumbers).insert(queryParams);
};
