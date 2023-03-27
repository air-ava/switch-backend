import { RequestHandler } from 'express';
import DocumentService from '../services/document.service';

const errorMessages = {
  schoolInfo: 'Could not add school Info',
  schoolContact: 'Could not add school Contact',
  schoolOwner: 'Could not add school Owner Details',
  useCase: 'Could not complete use case',
  schoolProfile: 'Could not get school profile',
};

export const listDocumentsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await DocumentService.listDocuments(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.schoolProfile, data: error });
  }
};
