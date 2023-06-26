import { RequestHandler } from 'express';
import ResponseService from '../utils/response';
import { Sanitizer } from '../utils/sanitizer';
import PreferenceService from '../services/preference.service';

export const createNotificationConfigurationCONTROLLER: RequestHandler = async (req, res) => {
  const { school, user } = req;
  const payload = { schoolId: school.id, owner: user, ...req.body };
  const response = await PreferenceService.createNotificationConfiguration(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const getNotificationContactsCONTROLLER: RequestHandler = async (req, res) => {
  const { school, user } = req;
  const payload = { schoolId: school.id, owner: user, ...req.body };
  const response = await PreferenceService.getNotificationContacts(payload.schoolId);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const deletePhoneOrEmailCONTROLLER: RequestHandler = async (req, res) => {
  const { school, user } = req;
  const payload = { schoolId: school.id, owner: user, ...req.body };
  const response = await PreferenceService.deletePhoneOrEmail(payload.schoolId);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const updateConfigurationCONTROLLER: RequestHandler = async (req, res) => {
  const { school, user } = req;
  const payload = { schoolId: school.id, owner: user, ...req.body };
  const response = await PreferenceService.updateConfiguration(payload.schoolId);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};
