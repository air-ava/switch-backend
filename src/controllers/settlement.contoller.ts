import { RequestHandler } from 'express';
import SettllementService from '../services/settllement.service';

const errorMessages = {
  listBanks: 'Could not list banks',
  addBank: 'Could not add bank',
  defaulBank: 'Error with defaulting Bank',
};

export const processSettlementCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { school, user } = req;
    const payload = { ...req.body, school, user };

    const response = await SettllementService.recordSettlementTransaction(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.addBank, data: error });
  }
};

export const listSettlementsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { school, user } = req;
    const payload = { ...req.body, school, user };

    const response = await SettllementService.listSettlements(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.addBank, data: error });
  }
};
