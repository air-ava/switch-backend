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