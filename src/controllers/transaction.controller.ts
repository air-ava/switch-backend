import { RequestHandler } from 'express';
import { getScholarship } from '../services/scholarship.service';
import { listTransactions, getTransaction } from '../services/transaction.service';
import { oldSendObjectResponse } from '../utils/errors';
import { Sanitizer } from '../utils/sanitizer';

export const listTransactionsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await listTransactions({ user_id: req.userId });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, data));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const getTransactionCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await getTransaction({ user_id: req.userId, id: req.params.id });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeScholarship(data), true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
