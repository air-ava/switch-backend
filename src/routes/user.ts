import { RequestHandler } from 'express';
import { createRole } from '../controllers/user';

export const userResource: RequestHandler = async (req, res) => {
  try {
    const response = await createRole(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
