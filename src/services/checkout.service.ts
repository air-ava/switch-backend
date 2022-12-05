/* eslint-disable no-console */
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
import { sendObjectResponse, BadRequestException, ResourceNotFoundError } from '../utils/errors';
import { randomstringGeenerator } from '../utils/utils';
import { businessChecker } from './helper.service';
import { createOrderREPO } from '../database/repositories/order.repo';
import { completeCartREPO, getOneCartREPO } from '../database/repositories/cart.repo';
import { getCarteForCheckout, getTotalCartedProduct } from '../database/repositories/cartProduct.repo';
import { completeCheckoutDTO } from '../dto/checkout.dto';
import { completeCheckoutValidator } from '../validators/checkout.validator';

export const checkout = async (data: completeCheckoutDTO): Promise<theResponse> => {
  const validation = completeCheckoutValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const {
    processor_reference,
    cartReference,
    processor_response: response = 'successful',
    shopper,
    business: businessReference,
    external_reference,
    metadata,
    shopper_address,
    business_address,
  } = data;
  const txReference = randomstringGeenerator('transactions');
  const orderReference = randomstringGeenerator('order');

  const { data: business } = await businessChecker({ reference: businessReference });

  const queryRunner = await getQueryRunner();
  try {
    const existingCart = await getOneCartREPO({ reference: cartReference }, []);
    if (existingCart.completed) return BadRequestException('Cart Currently Unavailable');

    await queryRunner.startTransaction();

    const cartedProduct = await getCarteForCheckout(existingCart.id, queryRunner);
    if (cartedProduct.length === 0) throw Error(`sorry, your cart is empty`);

    const { total: amount } = await getTotalCartedProduct(existingCart.id);
    if (amount === 0) throw Error(`sorry, your cart is empty`);

    await Promise.all(
      cartedProduct.map(async (item: any) => {
        const product = await getOneProductREPO({ id: item.id }, [], [], queryRunner);
        if (Number(product.quantity) < Number(item.quantity) && !item.unlimited) throw Error(`sorry, ${product.name} has insufficient Stock`);
        if (!item.unlimited) await decrementQuantity(product.id, item.quantity, queryRunner);
      }),
    );

    // createTransactionREPO(
    //   {
    //     reference: txReference,
    //     description: `cart: ${cartReference}`,
    //     purpose: `cart-checkout`,
    //     processor_reference,
    //     processor: 'paystack',
    //     response,
    //     amount,
    //     txn_type: 'debit',
    //     shopper,
    //     business: business.id,
    //   },
    //   queryRunner,
    // );

    await createOrderREPO(
      {
        reference: orderReference,
        payment_reference: txReference,
        shopper_address,
        business_address,
        shopper,
        business: business.id,
        cart_reference: cartReference,
        ...(metadata && { metadata }),
        ...(external_reference && { external_reference }),
      },
      queryRunner,
    );

    await completeCartREPO(cartReference, queryRunner);
    await queryRunner.commitTransaction();

    return sendObjectResponse('checkout completed successfully');
  } catch (error: any) {
    console.log({ error });

    await queryRunner.rollbackTransaction();
    return BadRequestException(error.message || 'Checkout completion failed, kindly try again');
  } finally {
    await queryRunner.release();
  }
};
