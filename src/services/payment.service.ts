/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import randomstring from 'randomstring';
import { Not } from 'typeorm';
import { STATUSES } from '../database/models/status.model';
import { getOneOrganisationREPO } from '../database/repositories/organisation.repo';
import { findPendingPayment, findMultiplePendingPayments, savePendingPaymentsREPO } from '../database/repositories/payments.repo';
import { findScholarship } from '../database/repositories/scholarship.repo';
import { getStudent } from '../database/repositories/student.repo';
import { findUser } from '../database/repositories/user.repo';
import { sendObjectResponse } from '../utils/errors';
import { sendEmail } from '../utils/mailtrap';
import { getSchoolDetails } from './school.service';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';

export const createPendingPayment = async (data: any): Promise<any> => {
  const { org_id, sender_id, recipient_id, scholarship_id, description, amount, ...rest } = data;

  const scholarship = await findScholarship({ id: scholarship_id }, [], ['Organisation']);
  if (!scholarship) throw Error('Sorry, Scholarship does not exist');

  const organisation = scholarship.Organisation;

  const pendingPayment = await findPendingPayment(
    { sender_id, org_id: org_id || organisation.id, recipient_id, amount, status: Not(STATUSES.DELETED) },
    [],
  );
  if (pendingPayment) throw Error('Payment already exists');

  const recipient = await findUser({ id: recipient_id }, []);
  if (!recipient) throw Error('Recipient does not exist');

  let scholar;
  if (rest.applied_to === 'scholar') {
    scholar = await findUser({ id: rest.applied_id }, []);
    if (!scholar) throw Error('Scholar does not exist');
  }

  const reference = randomstring.generate({ length: 5, capitalization: 'lowercase', charset: 'alphanumeric' });
  const payment = await savePendingPaymentsREPO({
    org_id: org_id || organisation.id,
    reference,
    sender_id,
    recipient_id,
    description,
    amount,
    ...rest,
  });

  //  todo: send payment recipient_id

  await sendEmail({
    recipientEmail: recipient.email,
    purpose: 'payment_request',
    templateInfo: {
      code: reference,
      name: ` ${recipient.first_name}`,
      organisation_name: ` ${organisation.name}`,
      description: `${description}`,
      organisation_email: ` ${organisation.email}`,
      scholarship_name: ` ${scholarship?.title}`,
      scholar_full_name: `${scholar?.first_name} ${scholar?.last_name}`,
    },
  });
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

export const buildCollectionRequestPayload = async ({ user, walletId, studentId, phoneNumber, amount }: any): Promise<any> => {
  let school;
  let reciever;
  if (user) {
    const { data: foundSchool } = await getSchoolDetails({ user });
    school = foundSchool;
  }
  if (studentId) {
    const student = await getStudent({ uniqueStudentId: studentId }, [], ['User', 'School', 'Classes', 'Classes.ClassLevel']);
    if (!student) throw new Error('Student not found');
    if (!user) {
      school = student.School;
      const organization = await getOneOrganisationREPO({ id: school.organisation_id }, [], ['Owner']);
      // eslint-disable-next-line no-param-reassign
      user = organization.Owner;
    }
    reciever = student;
  } else {
    const wallet = await WalletREPO.findWallet({ uniquePaymentId: walletId }, [], undefined, ['User']);
    if (!wallet) throw new Error('Wallet not found');
    reciever = wallet.User;
  }

  return {
    user,
    phoneNumber,
    amount,
    ...(studentId && { student: reciever }),
    ...(walletId && { reciever }),
    purpose: studentId ? 'school-fees' : 'top-up',
    school,
  };
};

// todo: get pending payment
