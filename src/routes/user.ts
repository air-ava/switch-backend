import { RequestHandler } from 'express';
import { deliverOrder, makeOrderRequest, pickUpOrder } from '../controllers/order';
import { createUser, createAddress } from '../controllers/user';

export const userResource: RequestHandler = async (req, res) => {
  try {
    const response = await createUser(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const AddressCreator: RequestHandler = async (req, res) => {
  try {
    const response = await createAddress(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
