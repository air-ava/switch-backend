import { RequestHandler } from 'express';
import { createPendingPayment, getPendingPayment, listPendingPayment } from '../services/payment.service';
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
    const schoolPayload = { user: req.user };
    const { walletId, studentId } = req.body;
    const { data: school } = await getSchoolDetails(schoolPayload);
    let reciever;
    if (studentId) {
      const student = await getStudent({ uniqueStudentId: studentId }, [], ['User', 'School', 'Classes', 'Classes.ClassLevel']);
      if (!student) throw new Error('Student not found');
      reciever = student;
    } else {
      const wallet = await WalletREPO.findWallet({ uniquePaymentId: walletId }, [], undefined, ['User']);
      if (!wallet) throw new Error('Wallet not found');
      reciever = wallet.User;
    }
    // const { data: reciever } = await fetchUserBySlug({ slug: req.body.studentId });

    const query = {
      user: req.user,
      phoneNumber: req.body.phoneNumber,
      amount: req.body.amount,
      ...(studentId && { student: reciever }),
      ...(walletId && { reciever }),
      purpose: studentId ? 'school-fees' : 'top-up',
      school,
    };
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
