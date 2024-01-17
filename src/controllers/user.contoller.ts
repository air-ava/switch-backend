import { Sanitizer } from './../utils/sanitizer';
import { RequestHandler } from 'express';
import { fetchUser, fetchUserBySlug, fetchUserProfile, listUsers, updateUserProfile } from '../services/user.service';
import BackOfficeService from '../services/backOfficeUser.service';
import ResponseService from '../utils/response';

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

// export const fetchUserCONTROLLER: RequestHandler = async (req, res) => {
//   try {
//     const payload = { ...req.body, user: req.user };
//     const response = await fetchUserProfile(payload);
//     const responseCode = response.success === true ? 200 : 400;
//     return res.status(responseCode).json(response);
//   } catch (error: any) {
//     return error.message
//       ? res.status(400).json({ success: false, error: error.message })
//       : res.status(500).json({ success: false, error: errorMessages.userDetails, data: error });
//   }
// };
export const fetchUserCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.body, user: req.user };
  const response = await fetchUserProfile(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const listUsersCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await listUsers(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.userDetails, data: error });
  }
};

export const listAdninUsersCONTROLLER: RequestHandler = async (req, res) => {
  const response = await BackOfficeService.listBackOfficeUser(req.body);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeAdmin));
};

export const getUserCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await fetchUser({ id: req.params.id });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.userDetails, data: error });
  }
};
