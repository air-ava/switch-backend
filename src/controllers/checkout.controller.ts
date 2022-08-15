import { RequestHandler } from 'express';
import randomstring from 'randomstring';
import { checkout } from '../services/checkout.service';
import { randomstringGeenerator } from '../utils/utils';

export const completeCheckoutCONTROLLER: RequestHandler = async (req, res) => {
  console.log({
    url: req.originalUrl,
    funct: 'completeCheckoutCONTROLLER',
  });

  try {
    const payload = {
      ...req.body,
      shopper: req.userId,
      processor_reference: randomstringGeenerator('transactions'),
      //   external_reference: randomstring.generate({ length: 10, capitalization: 'lowercase', charset: 'alphanumeric' })
    };
    const response = await checkout(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
