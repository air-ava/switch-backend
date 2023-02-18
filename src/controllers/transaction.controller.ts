import { RequestHandler } from 'express';
import { getScholarship } from '../services/scholarship.service';
import {
  listTransactions,
  getTransaction,
  addNoteToTransaction,
  statsOnTransactions,
  addDocumentToTransaction,
} from '../services/transaction.service';
import { oldSendObjectResponse } from '../utils/errors';
import { Sanitizer } from '../utils/sanitizer';

export const listTransactionsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await listTransactions({ userId: req.userId, type: req.query.purpose });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeTransaction)));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const getTransactionCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await getTransaction({ userId: req.userId, id: req.params.id });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeTransaction(data), true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const statsOnTransactionsCONTROLLER: RequestHandler = async (req, res) => {
  console.log({ userId: req.userId });
  try {
    const response = await statsOnTransactions({ userId: req.userId });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeDashboardStats(data), true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const addNoteToTransactionCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await addNoteToTransaction({ userId: req.userId, id: req.params.id, note: req.body.note });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, data, true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const addDocumentToTransactionCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await addDocumentToTransaction({ user: req.user, id: req.params.id, documents: req.body.documents });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, data, true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
