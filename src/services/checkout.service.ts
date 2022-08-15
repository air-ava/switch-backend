import { IsNull, MoreThan } from 'typeorm';
import { getQueryRunner } from '../database/helpers/db';
/**
 * check and lock product row
 * record a transaction
 * run a decrement on the quantity
 * record order
 * complete cart
 */

import { theResponse } from '../utils/interface';
import { decrementQuantity, getOneProductREPO } from '../database/repositories/product.repo';
import { sendObjectResponse, BadRequestException } from '../utils/errors';
import { randomstringGeenerator } from '../utils/utils';
import { createTransactionREPO } from '../database/repositories/transaction.repo';
import { businessChecker } from './helper.service';
import { createOrderREPO } from '../database/repositories/order.repo';
import { completeCartREPO, getOneCartREPO } from '../database/repositories/cart.repo';
import { getCartProductsREPO } from '../database/repositories/cartProduct.repo';

export const checkout = async (data: any): Promise<theResponse> => {
  const {
    processor_reference,
    cartReference,
    processor_response: response,
    shopper,
    business: businessReference,
    amount,
    quantity,
    shopper_address,
    business_address,
  } = data;
  const txReference = randomstringGeenerator('transactions');
  const orderReference = randomstringGeenerator('order');

  const { data: business } = await businessChecker({ reference: businessReference });

  const queryRunner = await getQueryRunner();
  try {
    const existingCart = await getOneCartREPO({ reference: cartReference }, []);
    const query = [
      {
        cart: existingCart.id,
        Product: {
          publish: true,
          expire_at: IsNull(),
          quantity: MoreThan(0),
          unlimited: false,
        },
      },
      {
        cart: existingCart.id,
        Product: {
          publish: true,
          expire_at: IsNull(),
          unlimited: true,
        },
      },
    ];
    const cartedProduct = await getCartProductsREPO(query, [], ['Product']);

    await queryRunner.startTransaction();

    // map frm here to
    await Promise.all(
      cartedProduct.map(async (item: any) => {
        const product = await getOneProductREPO({ id: item.product }, [], [], queryRunner);
        if (product.quantity < item.quantity) throw Error(`sorry, ${product.name} has insufficient Stock`);
        await decrementQuantity(product.id, item.quantity, queryRunner);
      }),
    );
    // here

    createTransactionREPO(
      {
        reference: txReference,
        description: `cart: ${cartReference}`,
        purpose: `cart-checkout`,
        processor_reference,
        processor: 'paystack',
        response,
        amount,
        txn_type: 'debit',
        shopper,
        business: business.id,
      },
      queryRunner,
    );

    await createOrderREPO(
      {
        reference: orderReference,
        payment_reference: txReference,
        shopper_address,
        business_address,
        shopper,
        business: business.id,
        cart_reference: cartReference,
      },
      queryRunner,
    );

    await completeCartREPO(cartReference, queryRunner);
    await queryRunner.commitTransaction();

    return sendObjectResponse('checkout completed successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    return BadRequestException('Checkout completion failed, kindly try again');
  } finally {
    await queryRunner.release();
  }
};
