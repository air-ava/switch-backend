import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { IProductTransactions } from '../modelInterfaces';
import { ProductTransactions } from '../models/productTransactions.model';

export const getProductTransaction = async (
  queryParam: Partial<IProductTransactions> | any,
  selectOptions: Array<keyof ProductTransactions>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ProductTransactions | undefined> => {
  return t
    ? t.manager.findOne(ProductTransactions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(ProductTransactions).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listProductTransaction = async (
  queryParam: Partial<IProductTransactions> | any,
  selectOptions: Array<keyof ProductTransactions>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ProductTransactions[]> => {
  return t
    ? t.manager.find(ProductTransactions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(ProductTransactions).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveProductTransaction = (
  queryParams: Partial<IProductTransactions> | Partial<IProductTransactions>[] | any,
  transaction?: QueryRunner,
): Promise<any> => {
  const payload = {
    code: `ptx_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return transaction ? transaction.manager.save(ProductTransactions, payload) : getRepository(ProductTransactions).save(payload);
};

export const updateProductTransaction = (
  queryParams: Pick<IProductTransactions, 'id'>,
  updateFields: Partial<IProductTransactions>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(ProductTransactions, queryParams, updateFields) : getRepository(ProductTransactions).update(queryParams, updateFields);
};
