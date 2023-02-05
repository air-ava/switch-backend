import { RequestHandler } from 'express';
import { answerQuestionnaireService, getQuestions, getSchoolDetails, updateOrganisationOwner, updateSchoolContact, updateSchoolDetails, updateSchoolInfo } from '../services/school.service';

const errorMessages = {
  schoolInfo: 'Could not add school Info',
  schoolContact: 'Could not add school Contact',
  schoolOwner: 'Could not add school Owner Details',
  useCase: 'Could not complete use case',
  schoolProfile: 'Could not get school profile',
};

export const schoolInfoCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user, organisation: req.user.organisation };
    const response = await updateSchoolInfo(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
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

export const accountUseCaseQuestionnaireCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await getQuestions({ process: String(req.query.process) });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: errorMessages.schoolOwner, data: error });
  }
};

export const answerUseCaseQuestionnaireCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.userId };
    const response = await answerQuestionnaireService(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.useCase, data: error });
    // return res.status(500).json({ success: false, error: error.message || errorMessages.schoolOwner, data: error });
  }
};

export const getSchoolCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { user: req.user };
    const response = await getSchoolDetails(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.schoolProfile, data: error });
  }
};

export const updateSchoolCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user };
    const response = await updateSchoolDetails(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.schoolProfile, data: error });
  }
};
