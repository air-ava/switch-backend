import { RequestHandler } from 'express';
import { createCart } from '../services/cart.service';

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
