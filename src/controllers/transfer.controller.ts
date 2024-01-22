import { RequestHandler } from 'express';
import ValidationError from '../utils/validationError';
import TransferValidator from '../validators/transfer.validator';
import TransferService from '../services/transfer.service';
import ReservedAccountService from '../services/reservedAccount.service';
import ResponseService from '../utils/response';
import { Sanitizer } from '../utils/sanitizer';
import { getBankList } from '../integration/wema/banks';

export const validateAccountDetailsCONTROLLER: RequestHandler = async (req, res) => {
  const { accountNumber, bankCode } = req.body;

  const validation = TransferValidator.verifyAccountDetails.validate({ accountNumber, bankCode });
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await TransferService.validateAccountDetails(req.body);

  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeCashDeposit(data));
};

export const bankTransferCONTROLLER: RequestHandler = async (req, res) => {
  console.log({ 'req.body': req.body });
  const validation = TransferValidator.bankTransfer.validate(req.body);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await TransferService.bankTransfer(req.body);

  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeCashDeposit(data));
};

export const wemaStatementCONTROLLER: RequestHandler = async (req, res) => {
  const validation = TransferValidator.wemaStatement.validate(req.body);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await ReservedAccountService.fetchMiniStatement(req.body);

  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const fetchAccountKYCCONTROLLER: RequestHandler = async (req, res) => {
  const validation = TransferValidator.wemaStatement.validate(req.body);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await ReservedAccountService.fetchAccountKYC(req.body);

  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};
export const blockAccountCONTROLLER: RequestHandler = async (req, res) => {
  const validation = TransferValidator.blockAccount.validate(req.body);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await ReservedAccountService.blockAccount(req.body);

  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const getBankListCONTROLLER: RequestHandler = async (req, res) => {
  const response = await getBankList();

  // const { data, message, error } = response;
  return ResponseService.success(res, 'Successful', response);
};
