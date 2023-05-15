import { RequestHandler, Request, Response } from 'express';
import ResponseService from '../utils/response';
import CronService from '../services/cron.service';

export const getCronCONTROLLER: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const response = await CronService.getCron(id);
  const { message, data, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const listCronCONTROLLER: RequestHandler = async (req, res) => {
  const response = await CronService.listCron();
  const { message, data, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const getCronHistoryCONTROLLER: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const response = await CronService.cronHistory(id);
  const { message, data, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const updateCronCONTROLLER: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { activate } = req.body;
  const response = await CronService.updateCron(id, req.body);
  const { message, data, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const createCronCONTROLLER: RequestHandler = async (req, res) => {
  const { title, schedule } = req.body;
  const response = await CronService.addCron(title, schedule);
  const { message, data, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const deleteCronCONTROLLER: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const response = await CronService.deleteCron(id);
  const { message, data, error } = response;
  return ResponseService.success(res, message || error, data);
};
