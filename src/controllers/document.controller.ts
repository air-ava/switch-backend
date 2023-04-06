import { RequestHandler } from 'express';
import { findUser } from '../database/repositories/user.repo';
import DocumentService from '../services/document.service';

const errorMessages = {
  listDocuments: 'Could not get list documents',
  verifyDocument: 'Could not verify document',
};

export const listDocumentsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await DocumentService.listDocuments(req.query);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.listDocuments, data: error });
  }
};

export const verifyDocumentCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, documentId: req.params.id };
    const response = await DocumentService.verifyDocument(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.verifyDocument, data: error });
  }
};

export const addDocumentAdminCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = { ...req.body, schoolId: req.params.id };
    const response = await DocumentService.addDocumentAdmin(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: errorMessages.verifyDocument, data: error });
  }
};
