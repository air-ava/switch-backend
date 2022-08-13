import { QueryRunner, InsertResult, getRepository } from 'typeorm';
import { IImage } from '../modelInterfaces';
import { Image } from '../models/image.model';

export const createImageREPO = (queryParams: Omit<IImage, 'id' | 'created_at' | 'updated_at'>, transaction?: QueryRunner): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Image, queryParams) : getRepository(Image).insert(queryParams);
};

export const getOneImageREPO = (
  queryParam: Partial<IImage>,
  selectOptions: Array<keyof Image>,
  transaction?: QueryRunner,
): Promise<IImage | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Image, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Image).findOne({ where: queryParam, ...(selectOptions.length && { select: selectOptions.concat(['id']) }) });
};
