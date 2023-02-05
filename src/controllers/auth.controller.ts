import { RequestHandler } from 'express';
import { changePasswordDTO } from '../dto/auth.dto';
import {
  businessLogin,
  changePassword,
  createUser,
  forgotPassword,
  newPassword,
  resendVerifyToken,
  resetPassword,
  userLogin,
  verifyAccount,
} from '../services/auth.service';
import { oldSendObjectResponse } from '../utils/errors';
import Settings from '../services/settings.service';

export const signUpCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await createUser(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const loginCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { is_business = false, ...rest } = req.body;
    await Settings.init();

    const response = is_business ? await businessLogin({ ...rest }) : await userLogin({ ...rest });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const verifyCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = {
      token: token || String(req.query.code),
      id: req.userId || req.params.userId,
    };
    const response = await verifyAccount(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const resendCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await resendVerifyToken(req.params.email);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const forgotCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await forgotPassword(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const newPasswordCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await newPassword(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const resetPasswordCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await resetPassword({ password: req.body.password, id: req.userId || req.params.code });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const changePasswordCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload: changePasswordDTO = { ...req.body, userId: req.userId };

    const response = await changePassword(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(oldSendObjectResponse(response.messaage, response.date, true));
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
