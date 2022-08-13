import { RequestHandler } from 'express';
import { businessLogin, createUser, shopperLogin } from '../services/auth.service';

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
    const { is_business, ...rest } = req.body;

    const response = is_business ? await businessLogin({ ...rest }) : await shopperLogin({ ...rest });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
