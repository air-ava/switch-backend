import { QueryRunner, InsertResult, getRepository, UpdateResult, Not, IsNull, MoreThan } from 'typeorm';
import { Product } from '../models/product.model';
import { ICartProduct } from '../modelInterfaces';
import { CartProduct } from '../models/cartProduct.model';

export const createCartProductREPO = (
  queryParams: Omit<ICartProduct, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'completed_at'>,
  transaction?: QueryRunner,
): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(CartProduct, queryParams) : getRepository(CartProduct).insert(queryParams);
};

export const createAndGetCartProductREPO = (
  queryParams: Omit<ICartProduct, 'id' | 'created_at' | 'updated_at'>,
  transaction?: QueryRunner,
): Promise<CartProduct> => {
  console.log({ queryParams });

  return transaction ? transaction.manager.save(CartProduct, queryParams) : getRepository(CartProduct).save(queryParams);
};

export const getOneCartProductREPO = (
  queryParam: Partial<ICartProduct | any>,
  selectOptions: Array<keyof CartProduct>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<ICartProduct | undefined | any> => {
  // console.log({ queryParam, selectOptions, relationOptions });
  return transaction
    ? transaction.manager.findOne(CartProduct, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(CartProduct).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const updateCartProductREPO = (
  queryParams: Partial<ICartProduct>,
  updateFields: Partial<ICartProduct>,
  transaction?: QueryRunner,
): Promise<UpdateResult> => {
  return transaction
    ? transaction.manager.update(CartProduct, queryParams, updateFields)
    : getRepository(CartProduct).update(queryParams, updateFields);
};

export const getCartProductsREPO = (
  queryParam:
    | Partial<ICartProduct>
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }
    | any,
  selectOptions: Array<keyof CartProduct>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<ICartProduct[]> => {
  return transaction
    ? transaction.manager.find(CartProduct, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(CartProduct).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const getTotalCartedProduct = async (cartId: number): Promise<any | undefined> => {
  const queryBuilder = getRepository(CartProduct).createQueryBuilder('cart_product');
  const response = await queryBuilder
    .leftJoin(Product, 'product', 'cart_product.product = product.id')
    .select('SUM(cart_product.quantity * product.unit_price)', 'total')
    .addSelect('SUM(cart_product.quantity)', 'totalqty')
    .where(
      'cart_product.cart = :cartId AND product.publish = :publish AND ((product.quantity > :quantity AND product.unlimited = :unlimited) OR product.unlimited = :nowUnlimited)',
      {
        cartId,
        publish: true,
        quantity: 0,
        unlimited: false,
        nowUnlimited: true,
      },
    )
    .getRawOne();

  return response;
};

export const getCarteForCheckout = async (cartId: number, transaction?: QueryRunner): Promise<any | undefined> => {
  const queryBuilder = transaction
    ? transaction.manager.createQueryBuilder<CartProduct>(CartProduct, 'cart_product').setLock('pessimistic_write')
    : getRepository(CartProduct).createQueryBuilder('cart_product');

  const response = await queryBuilder
    .leftJoin(Product, 'product', 'cart_product.product = product.id')
    .select('product.unit_price', 'unit_price')
    .addSelect('product.id', 'id')
    .addSelect('product.unlimited', 'unlimited')
    .addSelect('cart_product.quantity', 'quantity')
    .addSelect('cart_product.quantity * product.unit_price', 'price')
    .where(
      'cart_product.cart = :cartId AND product.publish = :publish AND ((product.quantity > :quantity AND product.unlimited = :unlimited) OR product.unlimited = :nowUnlimited)',
      {
        cartId,
        publish: true,
        quantity: 0,
        unlimited: false,
        nowUnlimited: true,
      },
    )
    .getRawMany();

  return response;
};
