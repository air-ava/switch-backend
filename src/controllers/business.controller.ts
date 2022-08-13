import { RequestHandler } from 'express';
import { createBusiness } from '../services/business.service';

export const createBusinessCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      owner: req.userId,
    };
    console.log({
      payload,
    });

    const response = await createBusiness(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    // console.log({
    //   error
    // });

    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
