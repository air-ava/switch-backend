import { RequestHandler } from 'express';
import { createProduct, viewAllProduct } from '../services/product.service';

export const createProductCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await createProduct(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const viewAllProductCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { business, from, to, search, quantity } = req.query;

    const response = await viewAllProduct({
      business: String(business),
      ...(from && { from: String(from) }),
      ...(to && { to: String(to) }),
      ...(search && { search: String(search) }),
      ...(quantity && { quantity: String(quantity) }),
    });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
