import { RequestHandler } from 'express';
import { buildCollectionRequestPayload, createPendingPayment, getPendingPayment, listPendingPayment } from '../services/payment.service';
import { getSchoolDetails } from '../services/school.service';
import { fetchUserBySlug } from '../services/user.service';
import { Service as BayonicService } from '../services/mobileMoney.service';
import { getStudent } from '../database/repositories/student.repo';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';

export const createPaymentCONTROLLER: RequestHandler = async (req, res) => {
  try {
    // console.log({ user: req.user });
    const payload = { ...req.body, sender_id: req.userId, org_id: req.user.organisation };
    const response = await createPendingPayment(payload);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const listPaymentsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const query = {
      viewer: req.query.viewer as 'recipient' | 'sender',
      user_id: req.userId,
      ...(req.query.viewer === 'sender' && { org_id: req.user.organisation }),
    };
    const response = await listPendingPayment(query);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const getPaymentCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const query = {
      viewer: req.query.viewer as 'recipient' | 'sender',
      user_id: req.userId,
      reference: req.params.code,
    };
    const response = await getPendingPayment(query);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const initiatePaymentCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { walletId, studentId, phoneNumber, amount } = req.body;
    const query = await buildCollectionRequestPayload({ user: req.user, walletId, studentId, phoneNumber, amount });
    const response = await BayonicService.initiateCollectionRequest(query);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
