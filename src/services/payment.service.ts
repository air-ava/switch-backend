import randomstring from 'randomstring';
import { Not } from 'typeorm';
import { STATUSES } from '../database/models/status.model';
import { findPendingPayment, savePendingPaymentsREPO } from '../database/repositories/payments.repo';
import { sendObjectResponse } from '../utils/errors';

export const createPendingPayment = async (data: any): Promise<any> => {
  const { org_id, sender_id, recipient_id, description, amount, ...rest } = data;

  const pendingPayment = await findPendingPayment({ sender_id, org_id, recipient_id, amount, status: [Not(STATUSES.SUCCESS)] }, []);
  if (pendingPayment) throw Error('Payment alreaf exists');

  const reference = randomstring.generate({ length: 5, capitalization: 'lowercase', charset: 'alphanumeric' });
  const payment = await savePendingPaymentsREPO({ org_id, reference, sender_id, recipient_id, description, amount, ...rest });

  return sendObjectResponse('payment created successfully', payment);
};
// todo: get pending payment
