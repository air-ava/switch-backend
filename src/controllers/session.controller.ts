import { RequestHandler } from 'express';
import ResponseService from '../utils/response';
import { Sanitizer } from '../utils/sanitizer';
import SessionService from '../services/session.service';

export const createSessionCONTROLLER: RequestHandler = async (req, res) => {
  const response = await SessionService.createEducationalSessions(req.body);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const createSchoolPeriodCONTROLLER: RequestHandler = async (req, res) => {
  const { educationalSession, school } = req;
  const payload = { educationalSession, school, ...req.body };
  const response = await SessionService.createSchoolPeriod(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const listPeriodsCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.query };
  const response = await SessionService.listPeriods(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const listSchoolPeriodsCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.query };
  const response = await SessionService.listSchoolPeriods(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const listEducationalLevels: RequestHandler = async (req, res) => {
  const payload = { ...req.query };
  const response = await SessionService.listEducationalLevels(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};
