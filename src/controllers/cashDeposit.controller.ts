import { RequestHandler } from 'express';
import { Sanitizer } from '../utils/sanitizer';
import ValidationError from '../utils/validationError';
import CashDepositsValidator from '../validators/cashDeposits.validator';
import CashDepositService from '../services/cashDeposit.service';
import DeviceService from '../services/device.service';
import ResponseService from '../utils/response';

export const cashDepositCONTROLLER: RequestHandler = async (req, res) => {
  const { user, school, educationalSession, deviceInfo, ipAddress } = req;
  const { code: studentId, feeCode: StudentFeeCode } = req.query;

  const formatedDeviceDetails = DeviceService.formatDeviceInfo(deviceInfo);
  const { data: deviceDetails } = await DeviceService.findOrCreateDevice({ loggedInUser: user, school, ...formatedDeviceDetails });

  const payload = {
    ...req.body,
    StudentFeeCode,
    studentId,
    ipAddress,
  };

  const validation = CashDepositsValidator.depositCash.validate(payload);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await CashDepositService.createCashDeposit({ deviceDetails, school, session: educationalSession, loggedInUser: user, ...payload });

  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const submitReciepCONTROLLER: RequestHandler = async (req, res) => {
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
