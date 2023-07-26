import { RequestHandler } from 'express';
import { buildCollectionRequestPayload, createPendingPayment, getPendingPayment, listPendingPayment } from '../services/payment.service';
import { getSchoolDetails } from '../services/school.service';
import { fetchUserBySlug } from '../services/user.service';
import { Service as BayonicService } from '../services/mobileMoney.service';
import BankTransferService from '../services/bankTransfer.service';
import { getStudent } from '../database/repositories/student.repo';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import { addDocumentToTransaction } from '../services/transaction.service';

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
    const query = await buildCollectionRequestPayload({ user: req.user, walletId, studentId, phoneNumber, amount, ussd: false });
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

export const recordBankTransferCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { user, school } = req;
    const payload = {
      user,
      school,
      ...req.body,
    };
    const { documents } = req.body;
    const response = await BankTransferService.recordBankTransfer(payload);

    if (response.success) {
      const { data } = response;
      if (documents) addDocumentToTransaction({ user: req.user, id: data.id, documents: req.body.documents });
    }
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const updateBankTransferCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await BankTransferService.updateBankTransfer(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const listBankTransferCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await BankTransferService.listBankTransfer(req.query);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const getBankTransferCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await BankTransferService.getBankTransfer(req.params);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const completeBankTransferCONTROLLER: RequestHandler = async (req, res) => {
  // const payload = {
  //   user: req.user,
  //   ...,
  // };
  try {
    const response = await BankTransferService.completeBankTransfer(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const notifySlackCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await BankTransferService.notifySlack(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error: any) {
    console.log({ error });
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};
