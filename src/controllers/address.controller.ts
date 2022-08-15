import { RequestHandler } from 'express';
import { getAddress } from '../services/address.service';

export const getAddressCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = req.params.ref ? await getAddress({ reference: req.params.ref }) : await getAddress({ owner: req.userId });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
