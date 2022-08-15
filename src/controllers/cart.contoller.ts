import { RequestHandler } from 'express';
import { createCart, deleteItem, getBusinessCart, getShopperCart } from '../services/cart.service';

export const createCartCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      shopper: req.userId,
    };
    const response = await createCart(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const getCartCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const businessAddress = String(req.query.is_business) === 'true';
    console.log({
      businessAddress,
      'req.query.is_business': req.query.is_business,
      'req.params.business': req.params,
    });

    const response = businessAddress
      ? await getBusinessCart({
          business: String(req.params.business),
          owner: Number(req.userId),
          ...(req.query.reference && { reference: String(req.query.reference) }),
        })
      : await getShopperCart({ reference: String(req.params.business), shopper: Number(req.userId) });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const deleteItemCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = {
      cartProductId: Number(req.params.item),
      shopper: Number(req.userId),
    };
    const response = await deleteItem(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

