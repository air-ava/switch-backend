import { RequestHandler } from 'express';
import { updateOrganisationOwner, updateSchoolContact, updateSchoolInfo } from '../services/school.service';

const errorMessages = {
  schoolInfo: 'Could not add school Info',
  schoolContact: 'Could not add school Contact',
  schoolOwner: 'Could not add school Owner Details',
};

export const schoolInfoCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user, organisation: req.user.organisation };
    const response = await updateSchoolInfo(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return res.status(500).json({ success: false, error: error.message || errorMessages.schoolInfo, data: error });
  }
};

export const schoolContactCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user, organisation: req.user.organisation };
    const response = await updateSchoolContact(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: errorMessages.schoolContact, data: error });
  }
};

export const schoolOwnerCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user, organisation: req.user.organisation };
    const response = await updateOrganisationOwner(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: errorMessages.schoolOwner, data: error });
  }
};
