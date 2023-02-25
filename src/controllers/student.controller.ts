import { RequestHandler } from 'express';
import StudentService from '../services/student.service';
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

export const getStudentCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { code: studentId } = req.params;
    const response = await StudentService.getStudent({ studentId });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeStudent(data)));
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.addStudent, data: error });
  }
};

export const listStudentCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { school } = req;
    const response = await StudentService.listStudents({ schoolId: school.id });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeStudent)));
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.addStudent, data: error });
  }
};
