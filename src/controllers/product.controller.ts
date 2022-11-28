import { RequestHandler } from 'express';
import { createProduct, viewAllProduct, viewAllProductCategories } from '../services/product.service';

export const createProductCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await createProduct(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const viewAllProductCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { from, to, search, quantity } = req.query;

    const response = await viewAllProduct({
      business: String(req.params.business),
      ...(from && { from: String(from) }),
      ...(to && { to: String(to) }),
      ...(search && { search: String(search) }),
      ...(quantity && { quantity: String(quantity) }),
    });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const viewAllProductCategoriesCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await viewAllProductCategories();
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
