import { RequestHandler } from 'express';
import { changePasswordDTO } from '../dto/auth.dto';
import {
  backOfficeVerifiesAccount,
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
import BackOfficeUserService from '../services/backOfficeUser.service';

export const signUpCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await createUser(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const adminSignUpCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await BackOfficeUserService.createAdmin(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const adminLoginCONTROLLER: RequestHandler = async (req, res) => {
  try {
    await Settings.init();

    const response = await BackOfficeUserService.backOfficeUserLogin(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const loginCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { is_business = false, ...rest } = req.body;
    await Settings.init();

    const response = is_business ? await businessLogin({ ...rest }) : await userLogin({ ...rest });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const adminVerifyCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = {
      token: token || String(req.query.code),
      id: req.userId || req.params.userId,
    };
    const response = await BackOfficeUserService.backOfficeVerifyAccount(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
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
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const resendCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload: any = {
      phone_number: {
        countryCode: '256',
      },
    };

    if (req.params.identity.includes('@')) payload.email = req.params.identity;
    else payload.phone_number.localFormat = req.params.identity;

    const response = await resendVerifyToken(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const forgotCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await forgotPassword(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const newPasswordCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await newPassword(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const resetPasswordCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await resetPassword({ password: req.body.password, id: req.userId || req.params.code });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const changePasswordCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload: changePasswordDTO = { ...req.body, userId: req.userId };

    const response = await changePassword(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(oldSendObjectResponse(response.messaage, response.date, true));
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const backOfficeVerifiesAccountCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { id: req.params.id };

    const response = await backOfficeVerifiesAccount(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
