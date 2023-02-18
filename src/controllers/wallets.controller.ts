import { RequestHandler } from 'express';
import { oldSendObjectResponse } from '../utils/errors';
import { Service as WalletService } from '../services/wallet.service';
import { getQueryRunner } from '../database/helpers/db';
import { Sanitizer } from '../utils/sanitizer';

export const getWalletCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await WalletService.getSchoolWallet({ user: req.user });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeWallet(data), true));
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

export const fundWalletPinCONTROLLER: RequestHandler = async (req, res) => {
  const t = await getQueryRunner();
  try {
    const payload: any = {
      user: req.user,
      amount: req.body.amount,
      description: req.body.description,
      t,
    };

    const { success, data: wallet } = await WalletService.getSchoolWallet({ user: req.user, t });
    payload.wallet_id = wallet.id;

    const response = await WalletService.creditWallet(payload);
    await t.commitTransaction();
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, data, true));
  } catch (error) {
    console.log({ error });
    await t.rollbackTransaction();
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
