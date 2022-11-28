import { RequestHandler } from 'express';
import { log } from 'winston';
import countries from '../miscillaneous/countries.json';
import { addSponsors, createSchorlaship, createSchorlashipEligibility, getScholarship, getScholarships } from '../services/scholarship.service';
import { oldSendObjectResponse } from '../utils/errors';
import { Log } from '../utils/logs';
import { sanitizeAllArray, Sanitizer, sanitizeScholarship } from '../utils/sanitizer';

export const countriesCONTROLLER: RequestHandler = async (req, res) => {
  try {
    return res.status(200).json(countries);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const createSchorlashipCONTROLLER: RequestHandler = async (req, res) => {
  try {
    // console.log({ user: req.user });
    const payload = { ...req.body, user: req.userId, organisation: req.user.organisation };
    const response = await createSchorlaship(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const createEligibilityCONTROLLER: RequestHandler = async (req, res) => {
  try {
    // console.log({ user: req.user });
    const payload = { ...req.body, userId: req.userId, organisation: req.user.organisation };
    const response = await createSchorlashipEligibility(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const addSponsorsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    // console.log({ user: req.user });
    const payload = { ...req.body, userId: req.userId, organisation: req.user.organisation };
    const response = await addSponsors(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
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
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const getScholarshipCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await getScholarship(req.params.code);
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeScholarship(data), true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
