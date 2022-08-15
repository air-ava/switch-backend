import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { IOrder } from '../modelInterfaces';
import { Order } from '../models/order.model';

export const createOrderREPO = (
  queryParams: Omit<IOrder, 'id' | 'created_at' | 'updated_at' | 'processed_at'>,
  transaction?: QueryRunner,
): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Order, queryParams) : getRepository(Order).insert(queryParams);
};

export const createAndGetOrderREPO = (
  queryParams: Omit<IOrder, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  transaction?: QueryRunner,
): Promise<Order> => {
  return transaction ? transaction.manager.save(Order, queryParams) : getRepository(Order).save(queryParams);
};

export const getOneOrderREPO = (
  queryParam: Partial<IOrder | any>,
  selectOptions: Array<keyof Order>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<IOrder | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Order, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Order).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const updateOrderREPO = (queryParams: Partial<IOrder>, updateFields: Partial<IOrder>, transaction?: QueryRunner): Promise<UpdateResult> => {
  return transaction ? transaction.manager.update(Order, queryParams, updateFields) : getRepository(Order).update(queryParams, updateFields);
};

export const getOrdersREPO = (
  queryParam:
    | Partial<IOrder>
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }
    | any,
  selectOptions: Array<keyof Order>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<IOrder[]> => {
  return transaction
    ? transaction.manager.find(Order, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Order).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};
