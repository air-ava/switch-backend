import { RequestHandler } from 'express';
import StudentService from '../services/student.service';
import ResponseService from '../utils/response';
import { NotFoundError, ValidationError, oldSendObjectResponse } from '../utils/errors';
import { Sanitizer } from '../utils/sanitizer';
import { getStudentsValidator, editStudentsValidator, editStudentFeeValidator } from '../validators/student.validator';

const errorMessages = {
  listClasses: 'Could not list classes',
  addStudent: 'Could not add student to School',
  schoolOwner: 'Could not add school Owner Details',
  useCase: 'Could not complete use case',
  schoolProfile: 'Could not get school profile',
};

export const listClassCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await StudentService.listClassLevels();
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.listClasses, data: error });
  }
};

export const addStudentToSchoolCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { school, organisation, educationalSession } = req;
    const payload = { ...req.body, school, organisation, session: educationalSession };

    const response = await StudentService.addStudentToSchool(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.addStudent, data: error });
  }
};

export const addGuardiansToStudentCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.body, ...req.params };
  const response = await StudentService.addGuardians(payload);
  const { message, data, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const editStudentCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { ...req.body, ...req.params };
  
  const { status } = req.body;
  const validation = editStudentsValidator.validate({ status });
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await StudentService.editStudent(payload);
  const { message, data, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const getStudentCONTROLLER: RequestHandler = async (req, res) => {
  const { code: studentId } = req.params;
  const response = await StudentService.getStudent({ studentId });
  const { data, message, error = errorMessages.addStudent } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeStudent(data));
};

export const getStudentPaymentHistoryCONTROLLER: RequestHandler = async (req, res) => {
  const { code: studentId } = req.params;
  const response = await StudentService.getStudentHistory({ studentId });
  const { data, message, error = errorMessages.addStudent } = response;
  return ResponseService.success(res, message || error, data);
};
export const getStudentFeesCONTROLLER: RequestHandler = async (req, res) => {
  const { code: studentId } = req.params;
  const response = await StudentService.getStudentFees({ studentId });
  const { data, message, error = errorMessages.addStudent } = response;
  return ResponseService.success(res, message || error, data);
};

export const deactivateStudentFeeCONTROLLER: RequestHandler = async (req, res) => {
  const { code: studentId, feeCode } = req.params;
  const response = await StudentService.deactivateStudentFee({ studentId, feeCode });
  const { data, message, error = errorMessages.addStudent } = response;
  return ResponseService.success(res, message || error, data);
};

export const editStudentFeeCONTROLLER: RequestHandler = async (req, res) => {
  const { code: studentId, feeCode } = req.params;
  const payload = { studentId, feeCode, ...req.body };

  const validation = editStudentFeeValidator.validate({ code: studentId, feeCode, ...req.body });
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await StudentService.editStudentFee(payload);
  const { data, message, error = errorMessages.addStudent } = response;
  return ResponseService.success(res, message || error, data);
};

export const deactivateStudentCONTROLLER: RequestHandler = async (req, res) => {
  const { code: studentId } = req.params;
  const response = await StudentService.deactivateStudent({ studentId });
  const { data, message, error = errorMessages.addStudent } = response;
  return ResponseService.success(res, message || error, data);
};

export const listStudentCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const { perPage, page, from, to } = req.query;
  const payload = { schoolId: school.id, perPage, page, from, to };

  const validation = getStudentsValidator.validate(payload);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await StudentService.listStudents(payload);
  const { data, message, error } = response;
  const { students, meta } = data;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(students, Sanitizer.sanitizeStudent), meta);
};

export const searchStudentCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const { students } = req.body;
  const response = await StudentService.searchStudents({ schoolId: school.id, students });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const addBulkStudentsToSchoolCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const { students } = req.body;
  const response = await StudentService.addBulkStudentsToSchool({ schoolId: school.id, students });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const addBulkStudentsToSchoolAdminCONTROLLER: RequestHandler = async (req, res) => {
  const { students, school: schoolId } = req.body;
  const response = await StudentService.addBulkStudentsToSchool({ schoolId, students });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const searchStudentAdminCONTROLLER: RequestHandler = async (req, res) => {
  const { students, school: schoolId } = req.body;
  const response = await StudentService.searchStudents({ schoolId, students });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const addClassToSchoolONTROLLER: RequestHandler = async (req, res) => {
  const payload = { educationalSession: req.educationalSession, ...req.body };
  const response = await StudentService.searchStudents(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const addStudentToSchoolAdminCONTROLLER: RequestHandler = async (req, res) => {
  const response = await StudentService.addStudentToSchool(req.body);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const listStudentAdminCONTROLLER: RequestHandler = async (req, res) => {
  const { perPage, cursor } = req.query;
  const response = await StudentService.listStudents({ schoolId: req.query.id, perPage, cursor });
  const { data, message, error } = response;
  const { students, meta } = data;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(students, Sanitizer.sanitizeStudent), meta);
};

export const listStundentsInSchoolClassCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const { perPage, page, from, to, classCode } = req.query;
  const response = await StudentService.listStundentsInSchoolClass({
    page,
    from,
    to,
    school,
    perPage,
    classCode: String(classCode),
    status: 'ACTIVE',
  });
  const { data, message, error } = response;
  const { meta, students } = data;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(students, Sanitizer.sanitizeStudentClass), meta);
};

export const classDetailsCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const { code: classCode } = req.params;
  const { perPage, cursor } = req.query;
  const response = await StudentService.classDetail({ school, perPage, cursor, classCode: String(classCode), status: 'ACTIVE' });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeClassLevel(data));
};

export const classAnalysisCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const { code: classCode } = req.params;
  const { groupBy } = req.query;
  const response = await StudentService.classAnalytics({
    school,
    groupBy: groupBy ? String(groupBy) : 'daily',
    classCode: String(classCode),
    status: 'ACTIVE',
  });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};
