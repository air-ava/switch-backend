import randomstring from 'randomstring';
import { Not } from 'typeorm';
import { STATUSES } from '../database/models/status.model';
import { findPendingPayment, findMultiplePendingPayments, savePendingPaymentsREPO } from '../database/repositories/payments.repo';
import { sendObjectResponse } from '../utils/errors';

export const createPendingPayment = async (data: any): Promise<any> => {
  const { org_id, sender_id, recipient_id, description, amount, ...rest } = data;

  const pendingPayment = await findPendingPayment({ sender_id, org_id, recipient_id, amount, status: Not(STATUSES.DELETED) }, []);
  if (pendingPayment) throw Error('Payment already exists');

  const reference = randomstring.generate({ length: 5, capitalization: 'lowercase', charset: 'alphanumeric' });
  const payment = await savePendingPaymentsREPO({ org_id, reference, sender_id, recipient_id, description, amount, ...rest });

  return sendObjectResponse('Payment created successfully', payment);
};

export const listPendingPayment = async ({
  viewer = 'sender',
  user_id,
  org_id,
}: {
  org_id?: number;
  user_id: string;
  viewer: 'recipient' | 'sender';
}): Promise<any> => {
  const query = viewer === 'recipient' ? { recipient_id: user_id } : { sender_id: user_id, org_id };
  const existingPayments = await findMultiplePendingPayments(query, []);
  if (!existingPayments.length) throw Error('Sorry, no payment has been created');

  return sendObjectResponse('Payment retrieved successfully', existingPayments);
};
// todo: get pending payment
