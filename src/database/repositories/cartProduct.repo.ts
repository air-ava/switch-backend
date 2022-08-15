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
  return transaction ? transaction.manager.save(CartProduct, queryParams) : getRepository(CartProduct).save(queryParams);
};

export const getOneCartProductREPO = (
  queryParam: Partial<ICartProduct | any>,
  selectOptions: Array<keyof CartProduct>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<ICartProduct | undefined | any> => {
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

export const getTotalCarted = (cart: number, product: number): Promise<{ total: number } | undefined> => {
  return getRepository(CartProduct)
    .createQueryBuilder('cart_product')
    .leftJoin(Product, 'product', 'cart_product.product = product.id')
    .select('SUM(cart_product.quantity * product.unit_price)', 'total')
    .where('cart_product.cart = :cart AND cart_product.product = :product', { cart, product })
    .andWhere('product.publish = :publish', { publish: true })
    .andWhere('product.expire_at = :expire_at', { expire_at: null })
    .andWhere('product.unlimited = :unlimited AND product.quantity = :quantity ', { unlimited: Not(false), quantity: Not(0) })
    .getRawOne();
};

export const getTotalCartedProduct = (cartId: number): Promise<any | undefined> => {
  return getRepository(CartProduct)
    .createQueryBuilder('product')
    .leftJoin(Product, 'product', 'cart_product.product = product.id')
    .select('SUM(cart_product.quantity * product.unit_price)', 'total')
    .addSelect('SUM(cart_product.quantit)', 'Qty')
    .where(
      'cart_product.id = :cartId AND product.publish = :publish AND product.expire_at = :expire_at AND product.quantity = :quantity AND product.unlimited = :unlimited',
      { cartId, publish: true, expire_at: IsNull(), quantity: MoreThan(0), unlimited: false },
    )
    .orWhere('cart_product.id = :cartId AND product.publish = :publish AND product.expire_at = :expire_at AND product.unlimited = :unlimited', {
      cartId,
      publish: true,
      expire_at: IsNull(),
      unlimited: true,
    })
    .getRawOne();
};
