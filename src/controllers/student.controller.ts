import { RequestHandler } from 'express';
import StudentService from '../services/student.service';

const errorMessages = {
  listClasses: 'Could not list classes',
  schoolContact: 'Could not add school Contact',
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
