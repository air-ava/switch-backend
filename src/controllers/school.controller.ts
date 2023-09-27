import { RequestHandler } from 'express';
import SchoolService, {
  answerQuestionnaireService,
  backOfficeVerifiesSchool,
  getQuestions,
  getSchoolDetails,
  listSchool,
  updateOrganisationOwner,
  updateSchoolContact,
  updateSchoolDetails,
  updateSchoolInfo,
} from '../services/school.service';
// import SchoolService from '../services/school.service';
import DocumentService from '../services/document.service';
import StudentService from '../services/student.service';
import ResponseService from '../utils/response';
import { Sanitizer } from '../utils/sanitizer';
import { addClass, getClassLevel } from '../validators/schools.validator';
import ValidationError from '../utils/validationError';

const errorMessages = {
  schoolInfo: 'Could not add school Info',
  schoolContact: 'Could not add school Contact',
  schoolOwner: 'Could not add school Owner Details',
  useCase: 'Could not complete use case',
  schoolProfile: 'Could not get school profile',
  verifySchool: 'Could not verify school',
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
    const payload = { ...req.body, user: req.user };
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
    const { educationalSession } = req;
    const payload = { user: req.user, session: educationalSession };
    const response = await getSchoolDetails(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.schoolProfile, data: error });
  }
};

export const listSchoolCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { user: req.user };
    const response = await listSchool(payload);
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

export const updateSchoolAdminCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, admin: true, schoolId: req.params.id };
    const response = await updateSchoolDetails(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.schoolProfile, data: error });
  }
};

export const getDocumentRequirementCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = req.query;
    const response = await DocumentService.listDocumentRequirements(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.schoolProfile, data: error });
  }
};

export const addOnboardingDocumentsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user };
    const response = await DocumentService.addOnboardingDocument(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.schoolProfile, data: error });
  }
};

export const verifySchoolCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.query };
    const response = await backOfficeVerifiesSchool(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.verifySchool, data: error });
  }
};

export const addClassToSchoolWithFeesCONTROLLER: RequestHandler = async (req, res) => {
  const { school, user, educationalSession } = req;
  const payload = { ...req.query, ...req.body, school, session: educationalSession };
  const response = await StudentService.addClassToSchoolWitFees(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const addClassToSchoolCONTROLLER: RequestHandler = async (req, res) => {
  const { school, educationalSession } = req;
  const { code } = req.params;
  const payload = { code, school, authSession: educationalSession };

  const validation = addClass.validate({ code });
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await SchoolService.addClassToSchool(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const listClassInSchoolCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const payload = { school };
  const response = await SchoolService.listClassInSchool(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeSchoolClass));
};

export const listClassLevelByEducationLevelCONTROLLER: RequestHandler = async (req, res) => {
  const { code } = req.params;
  const payload = { code };

  const validation = getClassLevel.validate({ code });
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await SchoolService.listClassLevelByEducationLevel(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeNoId));
};

export const listEducationLevelCONTROLLER: RequestHandler = async (req, res) => {
  const response = await SchoolService.educationLevel();
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeNoId));
};
