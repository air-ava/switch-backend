import { RequestHandler } from 'express';
import BankService from '../services/bank.service';
import { ValidationError, sendObjectResponse } from '../utils/errors';
import { Sanitizer } from '../utils/sanitizer';
import ResponseService from '../utils/response';
import { bankListValidator } from '../validators/banks.validator';

const errorMessages = {
  listBanks: 'Could not list banks',
  addBank: 'Could not add bank',
  defaulBank: 'Error with defaulting Bank',
  deleteBank: 'Error with deleting Bank',
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

export const listBanksBackOfficeCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await BankService.listBanksBackOffice();
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

  const validation = bankListValidator.validate(country);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await BankService.bankList(String(country));
  const { data, message, error } = response;
  ResponseService.success(res, message || error, data);
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

export const deleteBankCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { id: req.params.id };
    const response = await BankService.deleteBank(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.deleteBank, data: error });
  }
};
