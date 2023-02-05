import { RequestHandler } from 'express';
import { fetchUserProfile, updateUserProfile } from '../services/user.service';

const errorMessages = {
  userDetails: 'Could not update user details',
};

export const updateUserCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user };
    const response = await updateUserProfile(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.userDetails, data: error });
  }
};

export const fetchUserCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user };
    const response = await fetchUserProfile(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.userDetails, data: error });
  }
};
