import { listDirectors } from './../database/repositories/individual.repo';
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
import DirectorService from '../services/director.service';
import DocumentService from '../services/document.service';
import StudentService from '../services/student.service';
import AuditLogsService from '../services/auditLogs.service';
import ResponseService from '../utils/response';
import { Sanitizer } from '../utils/sanitizer';
import {
  addClass,
  addClassAdmin,
  addSchoolOfficerValidator,
  getClassLevel,
  getQuestionnaire,
  schoolContact,
  schoolInfo,
  schoolOwnerValidator,
  updateSchoolOfficerValidator,
} from '../validators/schools.validator';
import ValidationError from '../utils/validationError';
import { createBusinessValidator } from '../validators/business.validator';
import { STATUSES } from '../database/models/status.model';

const errorMessages = {
  schoolInfo: 'Could not add school Info',
  schoolContact: 'Could not add school Contact',
  schoolOwner: 'Could not add school Owner Details',
  useCase: 'Could not complete use case',
  schoolProfile: 'Could not get school profile',
  verifySchool: 'Could not verify school',
};

export const schoolInfoCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.body, user: req.user, organisation: req.user.organisation };

  const validation = schoolInfo.validate({ ...req.body, country: payload.user.country });
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await updateSchoolInfo(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const schoolContactCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.body, user: req.user };

  const validation = schoolContact.validate(req.body);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await updateSchoolContact(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const schoolOwnerCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.body, user: req.user, organisation: req.user.organisation };

  const validation = schoolOwnerValidator.validate(req.body);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await updateOrganisationOwner(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
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
  const { process, country = 'UGANDA', tag } = req.query;
  const payload = { process, country, tag };

  const validation = getQuestionnaire.validate(payload);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await DocumentService.listDocumentRequirements(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const addOnboardingDocumentsCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.body, user: req.user, organisation: req.organisation, school: req.school };

  // const validation = schoolOwnerValidator.validate(req.body);
  // if (validation.error) throw new ValidationError(validation.error.message);
  // const response = await DocumentService.addOnboardingDocument(payload);

  const response = await DocumentService.addMultipleDocuments(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
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
  return ResponseService.success(res, message || error);
};

export const addClassToSchoolAdminCONTROLLER: RequestHandler = async (req, res) => {
  const { backOfficeUser } = req;
  const { code, schoolCode } = req.params;
  const validation = addClassAdmin.validate({ code, schoolCode });
  if (validation.error) throw new ValidationError(validation.error.message);

  const {
    data: { school },
  } = await SchoolService.getSchoolAsAdmin(schoolCode);
  const payload = { code, school };

  const response = await SchoolService.addClassToSchool(payload);

  // record the action of the admin user
  const schoolClass = response.data;
  await AuditLogsService.createLog({
    event: 'add-class-to-school',
    user_type: 'backOfficeUsers',
    user: backOfficeUser.id,
    delta: JSON.stringify(schoolClass),
    table_type: 'schoolClass',
    table_id: schoolClass.id,
  });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error);
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

export const listDirectorsCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { school: req.school, ...req.query };
  const response = await DirectorService.listSchoolDirectors(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeIndividual));
};

export const addOfficerCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { organisation: req.organisation, school: req.school, user: req.user, ...req.body };

  const validation = addSchoolOfficerValidator.validate(req.body);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await DirectorService.addOrganisationOfficer(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeIndividual));
};

export const inviteOfficerCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { organisation: req.organisation, school: req.school, user: req.user, ...req.body };

  // const validation = addSchoolOfficerValidator.validate(req.body);
  // if (validation.error) throw new ValidationError(validation.error.message);

  const response = await DirectorService.sendInviteToOfficer(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeIndividual));
};

export const updateOfficerCONTROLLER: RequestHandler = async (req, res) => {
  const validatingPayload = { ...req.body, officerCode: req.params.code };
  const payload = { organisation: req.organisation, school: req.school, user: req.user, ...validatingPayload };

  const validation = updateSchoolOfficerValidator.validate(validatingPayload);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await DirectorService.updateOrganisationOfficer(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeNoId));
};

export const listRejectedDocumentsCONTROLLER: RequestHandler = async (req, res) => {
  const payload = {
    school: req.school,
    status: STATUSES.REJECTED,
    ...req.query,
  };
  const response = await DocumentService.listDocuments(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeNoId));
};
