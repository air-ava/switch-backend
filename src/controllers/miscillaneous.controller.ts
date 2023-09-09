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
import ResponseService from '../utils/response';

const errorMessages = {
  listJobTitles: 'Could not list job titles',
};

export const countriesCONTROLLER: RequestHandler = async (req, res) => {
  const { data, message } = oldSendObjectResponse('Countries retrieved successfully', countries);
  return ResponseService.success(res, message, data);
};

export const educationLevelCONTROLLER: RequestHandler = async (req, res) => {
  const { data, message } = oldSendObjectResponse('Education Level retrieved successfully', Settings.get('EDUCATIOAL_LEVEL').level, true);
  return ResponseService.success(res, message, data);
};

export const jobTitlesCONTROLLER: RequestHandler = async (req, res) => {
  const response = await listJobTitles();
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const getCurrenciesCONTROLLER: RequestHandler = async (req, res) => {
  const response = await getCurrencies();
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeCurrency));
};

export const uploadCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.body, user: req.userId };
  const response = await createAsset(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};
