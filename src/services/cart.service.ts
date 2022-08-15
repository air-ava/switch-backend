import { IsNull } from 'typeorm';
import { createAndGetCartREPO, getCartsREPO, getOneCartREPO, getTotalSellerCartedProduct, updateCartREPO } from '../database/repositories/cart.repo';
import {
  createAndGetCartProductREPO,
  deleteAProductREPO,
  getCartProductsREPO,
  getOneCartProductREPO,
  getTotalCartedProduct,
  updateCartProductREPO,
} from '../database/repositories/cartProduct.repo';
import { getOneProductREPO } from '../database/repositories/product.repo';
import { createCartDTO, deleteItemDTO, getBusinessCartDTO, getShopperCartDTO, updateCartDTO } from '../dto/cart.dto';
import { sendObjectResponse, BadRequestException, ResourceNotFoundError } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { randomstringGeenerator, sumOfArray, sumOfTwoCoulumnsArray } from '../utils/utils';
import {
  createCartValidator,
  deleteItemValidator,
  getBusinessCartValidator,
  getShopperCartValidator,
  updateCartValidator,
} from '../validators/cart.validator';
import { businessChecker } from './helper.service';

export const updateCart = async (data: updateCartDTO): Promise<theResponse> => {
  const validation = updateCartValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { products, cart: existingCart } = data;
  const { quantity, items } = products;

  try {
    const product = await getOneProductREPO({ reference: items }, []);
    if (!product) throw Error(`sorry, product not found`);
    if (!product.publish) throw Error(`sorry, product not found`);
    if (!product.unlimited && product.quantity === 0) throw Error(`sorry, product currently out of stock`);

    const { reference } = existingCart;
    let existingProductInCart = await getOneCartProductREPO({ cart: existingCart.id, product: product.id }, []);
    if (!existingProductInCart) existingProductInCart = await createAndGetCartProductREPO({ cart: existingCart.id, product: product.id, quantity });
    else {
      await updateCartProductREPO({ id: existingProductInCart.id }, { quantity });
    }
    const totalCartProduct = await getCartProductsREPO({ cart: existingCart.id }, [], ['Product']);

    const { total: cartTotal, totalqty: cartQty } = await getTotalCartedProduct(existingCart.id);

    await updateCartREPO(
      { reference },
      {
        amount: cartTotal,
        quantity: cartQty,
      },
    );

    const cart = await getOneCartREPO({ reference }, []);
    return sendObjectResponse('Cart updated successfully', {
      ...cart,
      items: totalCartProduct,
      amount: cartTotal,
      quantity: cartQty,
    });
  } catch (error: any) {
    // console.log(error);
    return BadRequestException(error.message || 'Cart update failed, kindly try again');
  }
};

export const createCart = async (data: createCartDTO): Promise<theResponse> => {
  const validation = createCartValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { products, shopper, business: BusinessReference } = data;
  const { quantity, items } = products;

  try {
    const { data: business } = await businessChecker({ reference: BusinessReference });
    const reference = randomstringGeenerator('cart');

    const product = await getOneProductREPO({ reference: items }, []);

    if (!product) throw Error(`sorry, product not found`);
    if (!product.publish) throw Error(`sorry, product not found`);
    if (!product.unlimited && product.quantity === 0) throw Error(`sorry, product currently out of stock`);

    const existingCart = await getOneCartREPO({ completed: false, shopper, business: business.id }, []);
    if (existingCart) {
      const updatedCart = await updateCart({
        products,
        cart: {
          reference: existingCart.reference,
          id: existingCart.id,
        },
      });

      //   console.log('updatedCart', updatedCart);
      return sendObjectResponse(updatedCart.message || 'Cart updated successfully', updatedCart.data);
    }
    const cart = await createAndGetCartREPO({
      reference,
      amount: product.unit_price,
      quantity,
      completed: false,
      shopper,
      business: business.id,
    });

    await createAndGetCartProductREPO({ cart: cart.id, product: product.id, quantity });

    return sendObjectResponse('Cart created successfully', cart);
  } catch (error: any) {
    console.log(error);
    return BadRequestException(error.message || 'Cart creation failed, kindly try again');
  }
};

export const getShopperCart = async (data: getShopperCartDTO): Promise<theResponse> => {
  const validation = getShopperCartValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { reference: BusinessReference, shopper } = data;

  try {
    const { data: business } = await businessChecker({ reference: BusinessReference });

    const existingCart = await getOneCartREPO({ completed: false, shopper, business: business.id }, []);
    if (!existingCart) throw Error(`Sorry, Cart Unavailable`);
    console.log({
      // existingCart,
      // reference,
    });
    const totalCartProduct = await getCartProductsREPO({ cart: existingCart.id }, [], ['Product']);

    const { total: cartTotal, totalqty: cartQty } = await getTotalCartedProduct(existingCart.id);

    return sendObjectResponse('Cart retrieved successfully', {
      ...existingCart,
      items: totalCartProduct,
      qty: cartQty,
      total: cartTotal,
    });
  } catch (error: any) {
    console.log(error);
    return BadRequestException(error.message || 'Cart retrieval failed, kindly try again');
  }
};

export const getBusinessCart = async (data: getBusinessCartDTO): Promise<theResponse> => {
  const validation = getBusinessCartValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { reference, owner, business: businessReference } = data;

  try {
    const { data: business } = await businessChecker({ reference: businessReference, owner });

    if (reference) {
      const existingCart = await getOneCartREPO({ reference }, []);
      if (!existingCart) throw Error(`Sorry, Cart Unavailable`);

      const totalCartProduct = await getCartProductsREPO({ cart: existingCart.id }, [], ['Product']);

      const { total: cartTotal, totalqty: cartQty } = await getTotalCartedProduct(existingCart.id);

      return sendObjectResponse('Cart retrieved successfully', {
        ...existingCart,
        items: totalCartProduct,
        qty: cartQty,
        total: cartTotal,
      });
    }

    const allCarts = await getCartsREPO({ business: business.id }, []);

    const { total: cartTotal, totalqty: cartQty } = await getTotalSellerCartedProduct(business.id);

    return sendObjectResponse('All customer carts retrieved successfully', {
      carts: allCarts,
      qty: cartQty,
      total: cartTotal,
    });
  } catch (error: any) {
    console.log(error);
    return BadRequestException(error.message || 'Cart retrieval failed, kindly try again');
  }
};

export const deleteItem = async (data: deleteItemDTO): Promise<theResponse> => {
  const validation = deleteItemValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { shopper, cartProductId } = data;

  try {
    const existingCartProduct = await getOneCartProductREPO({ id: cartProductId, deleted_at: IsNull() }, [], ['Cart']);
    if (!existingCartProduct) throw Error(`Sorry, Product Unavailable in Cart`);
    if (existingCartProduct.Cart.completed) throw Error(`Sorry, Cart Unavailable`);
    if (existingCartProduct.Cart.shopper !== shopper) throw Error(`Sorry, You do not have permission to remove item`);

    const deletedCartProduct = await deleteAProductREPO(existingCartProduct.id);

    const { total: cartTotal, totalqty: cartQty } = await getTotalCartedProduct(existingCartProduct.Cart.id);

    await updateCartREPO(
      { reference: existingCartProduct.Cart.reference },
      {
        amount: cartTotal,
        quantity: cartQty,
      },
    );
    return sendObjectResponse('Item removed from Cart successfully', deletedCartProduct);
  } catch (error: any) {
    console.log(error);
    return BadRequestException(error.message || 'Item removal from Cart failed, kindly try again');
  }
};
