import { RequestHandler } from 'express';
import { oldSendObjectResponse } from '../utils/errors';
import { Service as WalletService } from '../services/wallet.service';

export const getWalletCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await WalletService.getSchoolWallet({ user: req.user });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, data, true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const setWalletPinCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await WalletService.setWalletPin(req.user, req.body.pin, req.body.type);
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, data, true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const updateWalletPinCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = {
      user: req.user,
      oldPin: req.body.oldPin,
      newPin: req.body.newPin,
      type: req.body.type || 'permanent',
    };
    const response = await WalletService.updateWalletPin(payload);
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, data, true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
