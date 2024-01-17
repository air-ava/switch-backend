import { RequestHandler } from 'express';
import ResponseService from '../utils/response';
import AddressService, { createAddress, getAddress } from '../services/address.service';

export const getAddressCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const businessAddress = req.params.business || req.query.business;
    const response = businessAddress
      ? await getAddress({ reference: String(businessAddress), public: req.originalUrl.includes('public') })
      : await getAddress({ owner: req.userId });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const createAddressCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      userId: req.userId,
    };
    const response = await createAddress(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const getCountryStatesCONTROLLER: RequestHandler = async (req, res) => {
  const response = await AddressService.getCountryStates({ country: req.query.country as 'NIGERIA' | 'UGANDA' });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const getStatesDistrictsCONTROLLER: RequestHandler = async (req, res) => {
  const response = await AddressService.getStatesDistricts({ country: req.query.country as 'NIGERIA' | 'UGANDA', state: String(req.query.state) });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};
