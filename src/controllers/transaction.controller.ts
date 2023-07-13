import { RequestHandler } from 'express';
import { getScholarship } from '../services/scholarship.service';
import ResponseService from '../utils/response';
import {
  listTransactions,
  getTransaction,
  addNoteToTransaction,
  statsOnTransactions,
  addDocumentToTransaction,
  getTransactionsAnalytics,
} from '../services/transaction.service';
import { oldSendObjectResponse } from '../utils/errors';
import { Sanitizer } from '../utils/sanitizer';

export const listTransactionsCONTROLLER: RequestHandler = async (req, res) => {
  const { perPage, cursor, purpose: type } = req.query;
  const response = await listTransactions({ userId: req.userId, type, perPage, cursor });
  const { data, message, error } = response;
  const { transactions, meta } = data;
  return ResponseService.success(res, message || error, await Sanitizer.sanitizeTransactions(transactions), meta);
};

export const getTransactionCONTROLLER: RequestHandler = async (req, res) => {
  const response = await getTransaction({ userId: req.userId, id: req.params.id });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, await Sanitizer.sanitizeTransaction(data));
};

export const statsOnTransactionsCONTROLLER: RequestHandler = async (req, res) => {
  const response = await statsOnTransactions({ userId: req.userId });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, Sanitizer.sanitizeDashboardStats(data));
};

export const addNoteToTransactionCONTROLLER: RequestHandler = async (req, res) => {
  const response = await addNoteToTransaction({ userId: req.userId, id: req.params.id, note: req.body.note });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const addDocumentToTransactionCONTROLLER: RequestHandler = async (req, res) => {
  const response = await addDocumentToTransaction({ user: req.user, id: req.params.id, documents: req.body.documents });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const getTransactionsAnalyticsCONTROLLER: RequestHandler = async (req, res) => {
  const response = await getTransactionsAnalytics({ ...req.body, userId: req.userId });
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};
