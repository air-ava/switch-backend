import { RequestHandler } from 'express';
import { createAddress, getAddress } from '../services/address.service';

export const getAddressCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const businessAddress = req.params.business || req.query.business;
    const response = businessAddress
      ? await getAddress({ reference: String(businessAddress), public: req.originalUrl.includes('public') })
      : await getAddress({ owner: req.userId });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const createAddressCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      userId: req.userId,
    };
    const response = await createAddress(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
