import randomstring from 'randomstring';
import { Not } from 'typeorm';
import { STATUSES } from '../database/models/status.model';
import { findPendingPayment, findMultiplePendingPayments, savePendingPaymentsREPO } from '../database/repositories/payments.repo';
import { findUser } from '../database/repositories/user.repo';
import { sendObjectResponse } from '../utils/errors';
import { sendEmail } from '../utils/mailtrap';

export const createPendingPayment = async (data: any): Promise<any> => {
  const { org_id, sender_id, recipient_id, description, amount, ...rest } = data;

  const pendingPayment = await findPendingPayment({ sender_id, org_id, recipient_id, amount, status: Not(STATUSES.DELETED) }, []);
  if (pendingPayment) throw Error('Payment already exists');

  const recipient = await findUser({ id: recipient_id }, []);
  if (!recipient) throw Error('Recipient does not exist');

  const reference = randomstring.generate({ length: 5, capitalization: 'lowercase', charset: 'alphanumeric' });
  const payment = await savePendingPaymentsREPO({ org_id, reference, sender_id, recipient_id, description, amount, ...rest });

  //   //  todo: send payment recipient_id
  //   await sendEmail({
  //     recipientEmail: recipient.email,
  //     purpose: 'welcome_user',
  //     templateInfo: {
  //       code: reference,
  //       name: ` ${recipient.first_name}`,
  //       website: 'https://joinsteward.com/',
  //       email: 'support@joinsteward.com',
  //       userId: recipient.id,
  //     },
  //   });
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

export const getPendingPayment = async ({
  user_id,
  reference,
  viewer = 'recipient',
}: {
  viewer: 'recipient' | 'sender';
  reference: string;
  user_id: string;
}): Promise<any> => {
  const existingPayment = await findPendingPayment({ reference }, []);
  if (!existingPayment) throw Error('Sorry, payment not found');
  if (existingPayment[`${viewer}_id`] !== user_id) throw Error('Sorry, you do not have access to view');

  return sendObjectResponse('Payment retrieved successfully', existingPayment);
};
// todo: get pending payment
