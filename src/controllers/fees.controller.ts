import { RequestHandler } from 'express';
import SchoolService from '../services/school.service';
import FeesService from '../services/fees.service';
import ResponseService from '../utils/response';
import { Sanitizer } from '../utils/sanitizer';

export const getSchoolProductCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.params };
  const response = await FeesService.getSchoolProduct(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeFee(data));
};

export const listFeesCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const { type: feature_name } = req.query;
  const payload = { feature_name, school };
  const response = await FeesService.listFeesInSchool(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeFee));
};

export const listFeeTypesCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const payload = { ...req.query, school };
  const response = await FeesService.listFeeTypes(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeFeeType));
};

export const addFeeTypeCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const payload = { ...req.body, school };
  const response = await FeesService.createAFeeType(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const addFeeCONTROLLER: RequestHandler = async (req, res) => {
  const { school, educationalSession } = req;
  const { incomigFees } = req.body;
  const payload = { school, session: educationalSession };
  const response = Array.isArray(incomigFees)
    ? await FeesService.createAFee({ ...req.body, ...payload })
    : await FeesService.createFees({ incomigFees, ...payload });
  // const response = await FeesService.createAFee(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

// export const addFeeCONTROLLER: RequestHandler = async (req, res) => {
//   const { school, user, educationalSession } = req;
//   const payload = { ...req.query, ...req.body, school, session: educationalSession };
//   const response = await FeesService.createAFee(payload);
//   const { data, message, error } = response;
//   return ResponseService.success(res, message || error, data);
// };
