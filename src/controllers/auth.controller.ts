import { RequestHandler } from 'express';
import { businessLogin, createUser, forgotPassword, newPassword, resetPassword, userLogin, verifyAccount } from '../services/auth.service';

export const signUpCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await createUser(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const loginCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { is_business = false, ...rest } = req.body;

    const response = is_business ? await businessLogin({ ...rest }) : await userLogin({ ...rest });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const verifyCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { token } = req.body;

    const response = await verifyAccount({ token, id: req.userId });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const forgotCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await forgotPassword(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const newPasswordCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await newPassword(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const resetPasswordCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await resetPassword({ password: req.body.password, id: req.userId });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
