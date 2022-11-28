import { RequestHandler } from 'express';
import { log } from 'winston';
import { allBusinessAndProducts } from '../services/public.service';
import { oldSendObjectResponse } from '../utils/errors';
import { Log } from '../utils/logs';
import countries from '../miscillaneous/countries.json';
import { getScholarships } from '../services/scholarship.service';
import { Sanitizer } from '../utils/sanitizer';
import { getPartnership } from '../services/organisation.service';

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

export const getScholarshipsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await getScholarships();
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeScholarship)));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const getPartnershipScholarshipCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await getPartnership(req.params.slug);
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizePartner(data), true));
    // return res.status(responseCode).json(data);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
