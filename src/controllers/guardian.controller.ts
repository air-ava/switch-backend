import { RequestHandler } from 'express';
import { getPublicSchoolDetails } from '../services/school.service';
import ResponseService from '../utils/response';
import { guardianLogin } from '../services/auth.service';
import { gaurdianLoginValidator } from '../validators/guardian.validator';
import ValidationError from '../utils/validationError';

export const guardianLoginCONTROLLER: RequestHandler = async (req, res) => {

  const validation = gaurdianLoginValidator.validate(req.body);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await guardianLogin(req.body);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};
