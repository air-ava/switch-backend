import { RequestHandler } from 'express';
import { allBusiness, createBusiness, getBusiness, updateBusiness, viewAllBusiness } from '../services/business.service';
import { backOfficeVerifiesOrganisation } from '../services/organisation.service';

const errorMessages = {
  verifyOrganisation: 'Could not verify organisation',
};
export const createBusinessCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      owner: req.userId,
    };
    const response = await createBusiness(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const updateBusinessCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      owner: req.userId,
      reference: req.params.ref,
    };
    const response = await updateBusiness(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const getBusinessCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = {
      reference: req.params.ref,
      owner: req.userId,
    };
    const response = await getBusiness(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const viewAllBusinessCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = {
      owner: req.userId,
    };
    const response = await viewAllBusiness(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const verifyOrganisationCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.query };
    const response = await backOfficeVerifiesOrganisation(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.verifyOrganisation, data: error });
  }
};
