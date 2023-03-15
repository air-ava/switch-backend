import { RequestHandler } from 'express';
import BankService from '../services/bank.service';
import { sendObjectResponse } from '../utils/errors';
import { Sanitizer } from '../utils/sanitizer';

const errorMessages = {
  listBanks: 'Could not list banks',
  addBank: 'Could not add bank',
  defaulBank: 'Error with defaulting Bank',
};

export const listBanksCONTROLLER: RequestHandler = async (req, res) => {
  const { user, school } = req;
  try {
    const response = await BankService.listBanks({ user, school });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.listBanks, data: error });
  }
};

export const bankListCONTROLLER: RequestHandler = async (req, res) => {
  const { country } = req.query;
  try {
    const response = await BankService.bankList(String(country));
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.listBanks, data: error });
  }
};

export const addBankCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { school, user } = req;
    const payload = { ...req.body, school, user };

    const response = await BankService.creatBank(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.addBank, data: error });
  }
};

export const defaulBankCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { school, user } = req;
    const payload = { ...req.params, ...req.query, school, user };

    const response = await BankService.defaultBank(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.defaulBank, data: error });
  }
};
