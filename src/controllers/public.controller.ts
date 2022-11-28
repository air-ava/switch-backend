import { RequestHandler } from 'express';
import { log } from 'winston';
import { allBusinessAndProducts } from '../services/public.service';
import { oldSendObjectResponse } from '../utils/errors';
import { Log } from '../utils/logs';
import countries from '../miscillaneous/countries.json';

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
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const countriesCONTROLLER: RequestHandler = async (req, res) => {
  try {
    return res.status(200).json(oldSendObjectResponse('Countries retrieved successfully', countries));
  } catch (error) {
    log(Log.fg.red, error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
