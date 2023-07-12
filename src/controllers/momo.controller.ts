import { RequestHandler, Request, Response } from 'express';
import ResponseService from '../utils/response';
import MomoService from '../services/momo.service';

export const requestPaymentCONTROLLER: RequestHandler = async (req, res) => {
  const response = await MomoService.requestPayment(req.body);
  const { message, data, error } = response;
  return ResponseService.success(res, message || error, data);
};
