import { RequestHandler } from 'express';
import StudentService from '../services/student.service';
import ResponseService from '../utils/response';
import { oldSendObjectResponse } from '../utils/errors';
import { Sanitizer } from '../utils/sanitizer';

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
    const { school, organisation } = req;
    const payload = { ...req.body, school, organisation };

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

export const listStudentCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const response = await StudentService.listStudents({ schoolId: school.id });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeStudent));
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
  try {
    const response = await StudentService.addStudentToSchool(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.addStudent, data: error });
  }
};

export const listStudentAdminCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await StudentService.listStudents({ schoolId: req.query.id });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeStudent)));
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.addStudent, data: error });
  }
};

export const listStundentsInSchoolClassCONTROLLER: RequestHandler = async (req, res) => {
  const { school } = req;
  const response = await StudentService.listStundentsInSchoolClass({ school, classCode: String(req.query.classCode), status: 'ACTIVE' });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeStudentInClass(data));
};
