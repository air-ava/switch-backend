import { RequestHandler } from 'express';
import { log } from 'winston';
import countries from '../miscillaneous/countries.json';
import { createAsset } from '../services/assets.service';
import { getCurrencies } from '../services/curencies.service';
import { oldSendObjectResponse } from '../utils/errors';
import { Log } from '../utils/logs';
import { Sanitizer } from '../utils/sanitizer';
import Settings from '../services/settings.service';
import { listJobTitles } from '../services/helper.service';

const errorMessages = {
  listJobTitles: 'Could not list job titles',
};

export const countriesCONTROLLER: RequestHandler = async (req, res) => {
  try {
    return res.status(200).json(oldSendObjectResponse('Countries retrieved successfully', countries));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const educationLevelCONTROLLER: RequestHandler = async (req, res) => {
  try {
    // const educationLevel = JSON.parse();
    return res.status(200).json(oldSendObjectResponse('Education Level retrieved successfully', Settings.get('EDUCATIOAL_LEVEL').level, true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const jobTitlesCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await listJobTitles();
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.listJobTitles, data: error });
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
