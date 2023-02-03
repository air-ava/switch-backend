import { RequestHandler } from 'express';
import { updateSchoolContact, updateSchoolInfo } from '../services/school.service';

export const schoolInfoCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await updateSchoolInfo(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const schoolContactCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await updateSchoolContact(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
