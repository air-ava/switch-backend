import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { IProduct } from '../modelInterfaces';
import { Product } from '../models/product.model';

export const createProductREPO = (
  queryParams: Omit<IProduct, 'id' | 'created_at' | 'updated_at' | 'expire_at'>,
  transaction?: QueryRunner,
): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Product, queryParams) : getRepository(Product).insert(queryParams);
};

export const createAndGetProductREPO = (
  queryParams: Omit<IProduct, 'id' | 'created_at' | 'updated_at' | 'expire_at'>,
  transaction?: QueryRunner,
): Promise<Product> => {
  return transaction ? transaction.manager.save(Product, queryParams) : getRepository(Product).save(queryParams);
};

export const getOneProductREPO = (
  queryParam: Partial<IProduct | any>,
  selectOptions: Array<keyof Product>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<IProduct | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Product, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
        lock: { mode: 'pessimistic_write' },
      })
    : getRepository(Product).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const updateProductREPO = (
  queryParams: Partial<IProduct>,
  updateFields: Partial<IProduct>,
  transaction?: QueryRunner,
): Promise<UpdateResult> => {
  return transaction ? transaction.manager.update(Product, queryParams, updateFields) : getRepository(Product).update(queryParams, updateFields);
};

export const getProductesREPO = (
  queryParam:
    | Partial<IProduct>
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }
    | any,
  selectOptions: Array<keyof Product>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<IProduct[]> => {
  return transaction
    ? transaction.manager.find(Product, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Product).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const decrementQuantity = async (id: number, quantity: number, transaction?: QueryRunner): Promise<UpdateResult> => {
  return transaction
    ? transaction.manager.decrement(Product, { id }, 'quantity', quantity)
    : getRepository(Product).decrement({ id }, 'quantity', quantity);
};
