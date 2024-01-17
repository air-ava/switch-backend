import { RequestHandler } from 'express';
import { Sanitizer } from '../utils/sanitizer';
import ValidationError from '../utils/validationError';
import CashDepositsValidator from '../validators/cashDeposits.validator';
import CashDepositService from '../services/cashDeposit.service';
import DeviceService from '../services/device.service';
import ResponseService from '../utils/response';

export const cashDepositCONTROLLER: RequestHandler = async (req, res) => {
  const { user, school, educationalSession, deviceInfo, ipAddress } = req;
  const { code: studentId, feeCode: studentFeeCode } = req.query;

  const formatedDeviceDetails = DeviceService.formatDeviceInfo(deviceInfo);
  const { data: deviceDetails } = await DeviceService.findOrCreateDevice({ loggedInUser: user, school, ...formatedDeviceDetails });

  const payload = {
    ...req.body,
    studentFeeCode,
    studentId,
    ipAddress,
  };

  const validation = CashDepositsValidator.depositCash.validate(payload);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await CashDepositService.createCashDeposit({ deviceDetails, school, session: educationalSession, loggedInUser: user, ...payload });

  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const submitRecieptCONTROLLER: RequestHandler = async (req, res) => {
  const { user, school, deviceInfo, ipAddress } = req;

  const formatedDeviceDetails = DeviceService.formatDeviceInfo(deviceInfo);
  const { data: deviceDetails } = await DeviceService.findOrCreateDevice({ loggedInUser: user, school, ...formatedDeviceDetails });

  const payload = {
    ...req.body,
    ipAddress,
  };

  const validation = CashDepositsValidator.recieptSubmission.validate(payload);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await CashDepositService.submitRecieptForCashDeposits({
    deviceDetails,
    school,
    loggedInUser: user,
    ...payload,
  });

  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const reviewCashDepositsCONTROLLER: RequestHandler = async (req, res) => {
  const { user, school, deviceInfo, ipAddress } = req;
  const { reference } = req.params;

  const formatedDeviceDetails = DeviceService.formatDeviceInfo(deviceInfo);
  const { data: deviceDetails } = await DeviceService.findOrCreateDevice({ loggedInUser: user, school, ...formatedDeviceDetails });

  const payload = {
    ...req.body,
    transactionReference: reference,
    ipAddress,
  };

  const validation = CashDepositsValidator.reviewCashDeposit.validate(payload);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await CashDepositService.reviewCashDeposits({
    deviceDetails,
    school,
    loggedInUser: user,
    ...payload,
  });

  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const updateCashDepositRecordCONTROLLER: RequestHandler = async (req, res) => {
  const { user, school, deviceInfo, ipAddress } = req;
  const { code } = req.params;

  const formatedDeviceDetails = DeviceService.formatDeviceInfo(deviceInfo);
  const { data: deviceDetails } = await DeviceService.findOrCreateDevice({ loggedInUser: user, school, ...formatedDeviceDetails });

  const payload = {
    ...req.body,
    code,
    ipAddress,
  };

  const validation = CashDepositsValidator.updateCashDeposit.validate(payload);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await CashDepositService.updateCashDepositRecord({
    deviceDetails,
    school,
    loggedInUser: user,
    ...payload,
  });

  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const listCashDepositCONTROLLER: RequestHandler = async (req, res) => {
  const { school, educationalSession } = req;

  const validation = CashDepositsValidator.listCashDeposit.validate(req.query);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await CashDepositService.listCashDeposit({
    school,
    session: educationalSession,
    ...req.query,
  });

  const { data, message, error } = response;
  const { cashDeposits, meta } = data;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(cashDeposits, Sanitizer.sanitizeCashDeposit), meta);
};

export const getCashDepositCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const { code } = req.params;

  const validation = CashDepositsValidator.getCashDeposit.validate(req.params);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await CashDepositService.getCashDeposit({ school, code });

  const { data, message, error } = response;
  // const { cashDeposits, meta } = data;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeCashDeposit(data));
};
