import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { ICart } from '../modelInterfaces';
import { Cart } from '../models/cart.model';

export const createCartREPO = (
  queryParams: Omit<ICart, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'completed_at'>,
  transaction?: QueryRunner,
): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Cart, queryParams) : getRepository(Cart).insert(queryParams);
};

export const createAndGetCartREPO = (
  queryParams: Omit<ICart, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'completed_at'>,
  transaction?: QueryRunner,
): Promise<Cart> => {
  return transaction ? transaction.manager.save(Cart, queryParams) : getRepository(Cart).save(queryParams);
};

export const getOneCartREPO = (
  queryParam: Partial<ICart | any>,
  selectOptions: Array<keyof Cart>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<ICart | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Cart, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Cart).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const updateCartREPO = (queryParams: Partial<ICart>, updateFields: Partial<ICart>, transaction?: QueryRunner): Promise<UpdateResult> => {
  return transaction ? transaction.manager.update(Cart, queryParams, updateFields) : getRepository(Cart).update(queryParams, updateFields);
};

export const completeCartREPO = (reference: string, transaction?: QueryRunner): Promise<UpdateResult> => {
  return transaction
    ? transaction.manager.update(
        Cart,
        { reference },
        {
          completed: true,
          completed_at: new Date(),
        },
      )
    : getRepository(Cart).update(
        { reference },
        {
          completed: true,
          completed_at: new Date(),
        },
      );
};

export const getCartsREPO = (
  queryParam:
    | Partial<ICart>
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }
    | any,
  selectOptions: Array<keyof Cart>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<ICart[]> => {
  return transaction
    ? transaction.manager.find(Cart, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Cart).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

// export const incrementBalance = async (id: number, amount: number, t?: QueryRunner): Promise<UpdateResult> => {
//   return t ? t.manager.increment(Wallets, { id }, 'balance', amount) : getRepository(Wallets).increment({ id }, 'balance', amount);
// };

// export const decrementBalance = async (id: number, amount: number, t?: QueryRunner): Promise<UpdateResult> => {
//   return t ? t.manager.decrement(Wallets, { id }, 'balance', amount) : getRepository(Wallets).decrement({ id }, 'balance', amount);
// };
