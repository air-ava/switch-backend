import { RequestHandler } from 'express';
import SchoolService from '../services/school.service';
import FeesService from '../services/fees.service';
import ResponseService from '../utils/response';
import { Sanitizer } from '../utils/sanitizer';
import { editFeeValidator, getClassFeesValidator, getFeeValidator, getFeesValidator } from '../validators/fee.validator';
import ValidationError from '../utils/validationError';

export const getSchoolProductCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.params };

  const validation = getFeeValidator.validate(payload);
  if (validation.error) throw new ValidationError(validation.error.message);

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
  const payload = { school, authSession: educationalSession };
  const response = Array.isArray(incomigFees)
    ? await FeesService.createFees({ incomigFees, ...payload })
    : await FeesService.createAFee({ ...req.body, ...payload });
  // const response = await FeesService.createAFee(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const listClassFeeCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const payload = { ...req.query, school };
  const response = await FeesService.listClassFee(payload);
  const { data, message, error } = response;
  const { meta, classes } = data;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(classes, Sanitizer.sanitizeByClass), meta);
};

export const getFeesInClassCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const payload = { ...req.params, school };

  const validation = getClassFeesValidator.validate({ ...req.params });
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await FeesService.getFeesInClass(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const feeDetailsCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const payload = { ...req.query, school };
  const response = await FeesService.feesDetails(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeNoId));
};

export const deleteFeeCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const { code } = req.params;

  const validation = getFeeValidator.validate({ code });
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await FeesService.deleteFee({ code, school });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeNoId(data));
};

export const editFeeCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const { code } = req.params;
  const payload = { code, ...req.body };

  const validation = editFeeValidator.validate(payload);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await FeesService.editFee({ school, ...payload });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeNoId(data));
};

export const deleteFeesCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const validation = getFeesValidator.validate(req.query);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await FeesService.deleteFees({ ...req.query, school });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeNoId(data));
};
