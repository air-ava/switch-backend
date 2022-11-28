import { RequestHandler } from 'express';
import { log } from 'winston';
import countries from '../miscillaneous/countries.json';
import { createAsset } from '../services/assets.service';
import { getCurrencies } from '../services/curencies.service';
import { oldSendObjectResponse } from '../utils/errors';
import { Log } from '../utils/logs';
import { Sanitizer } from '../utils/sanitizer';

export const countriesCONTROLLER: RequestHandler = async (req, res) => {
  try {
    return res.status(200).json(oldSendObjectResponse('Countries retrieved successfully', countries));
  } catch (error) {
    log(Log.fg.red, error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const getCurrenciesCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await getCurrencies();
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeCurrency)));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const uploadCONTROLLER: RequestHandler = async (req, res) => {
  try {
    console.log({ 'req.body.imagePath': req.body.imagePath });
    const payload = { ...req.body, user: req.userId };

    const response = await createAsset(payload);
    const responseCode = response.success === true ? 200 : 400;
    // const { data, message, error } = response;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return res.status(error.http_code || 500).json({ success: false, error: error.message || 'Could not fetch beneficiaries.' });
  }
};
