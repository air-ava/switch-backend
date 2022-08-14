import { RequestHandler } from 'express';
import { allBusinessAndProducts } from '../services/public.service';

export const allBusinessAndProductsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { from, to, search, quantity } = req.query;

    const response = await allBusinessAndProducts({
      ...(from && { from: String(from) }),
      ...(to && { to: String(to) }),
      ...(search && { search: String(to) }),
      ...(quantity && { quantity: String(quantity) }),
    });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
