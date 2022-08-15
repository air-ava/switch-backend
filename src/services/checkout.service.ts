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
import { completeCartREPO } from '../database/repositories/cart.repo';

export const checkout = async (data: any): Promise<theResponse> => {
  const {
    cartedProduct,
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

  const queryRunner = await getQueryRunner();
  try {
    await queryRunner.startTransaction();
    const product = await getOneProductREPO({ id: cartedProduct.id }, [], [], queryRunner);

    const { data: business } = await businessChecker({ reference: businessReference });

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

    await decrementQuantity(product.id, quantity, queryRunner);

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
    return sendObjectResponse('checkout completed successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    return BadRequestException('Checkout completion failed, kindly try again');
  } finally {
    await queryRunner.release();
  }
};
