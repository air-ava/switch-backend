import nodeMailer from 'nodemailer';
import { renderFile } from 'pug';
import { MAILTRAP_PASS, MAILTRAP_USER, MAILTRAP_HOST, MAILTRAP_PORT } from './secrets';

const EMAIL_TEMPLATES_PATH = `${process.cwd()}/templates`;

export const transporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: { user: MAILTRAP_USER, pass: MAILTRAP_PASS },
  // host: 'smtp.mailtrap.io',
  // port: 2525,
  // // secure: true,
  // // tls: { ciphers: 'SSLv3' },
  // auth: { user: MAILTRAP_USER, pass: MAILTRAP_PASS  },
});

export function getTemplateAndSubjectFromPurpose(purpose: string): { subject: string; template: string } {
  switch (purpose) {
    case 'order_received':
      return { subject: 'Your order has been received', template: `${EMAIL_TEMPLATES_PATH}/order_received.pug` };
    case 'payment_processed_successfully':
      return { subject: 'Your payment was successfully processed', template: `${EMAIL_TEMPLATES_PATH}/payment_processed_successfully.pug` };
    case 'vendor_account_created':
      return { subject: 'Vendor Account Created', template: `${EMAIL_TEMPLATES_PATH}/vendor.pug` };
    case 'account_email_activate':
      return { subject: 'Activate your Account', template: `${EMAIL_TEMPLATES_PATH}/activation.pug` };
    case 'welcome_user':
      // return { subject: 'Welcome to Steward', template: `${EMAIL_TEMPLATES_PATH}/welcome_email_verification.pug` };
      return { subject: 'Welcome to Steward', template: `${EMAIL_TEMPLATES_PATH}/verify-email.pug` };
    case 'application_recieved':
      return { subject: 'Application Recieved', template: `${EMAIL_TEMPLATES_PATH}/application_recieved.pug` };
    case 'student_payment_details':
      return { subject: 'Your Wards Payment Details', template: `${EMAIL_TEMPLATES_PATH}/student_payment_details.pug` };
    case 'guardian_login':
      return { subject: 'View Your Wards Details', template: `${EMAIL_TEMPLATES_PATH}/guardian_login.pug` };
    case 'application_sent':
      return { subject: 'Thank you for your application', template: `${EMAIL_TEMPLATES_PATH}/application_sent.pug` };
    case 'director_invite':
      return { subject: 'Invite to complete owners verification', template: `${EMAIL_TEMPLATES_PATH}/director_invite.pug` };
    case 'bank_transfer':
      return { subject: 'Bank Transfer Completed', template: `${EMAIL_TEMPLATES_PATH}/director_invite.pug` };
    case 'payment_request':
      return { subject: 'Payment Request', template: `${EMAIL_TEMPLATES_PATH}/payment_request.pug` };
    case 'otp_validate':
      return { subject: 'OTP verification', template: `${EMAIL_TEMPLATES_PATH}/welcome.pug` };
    default:
      throw new Error('template not found');
  }
}

export const sendEmail = async ({
  recipientEmail,
  purpose,
  templateInfo,
}: {
  recipientEmail: string;
  purpose: string;
  templateInfo: { [key: string]: string };
}): Promise<any> => {
  const { template, subject } = getTemplateAndSubjectFromPurpose(purpose);
  const now = new Date();
  // eslint-disable-next-line no-param-reassign
  templateInfo.year = `${now.getFullYear()}`;

  return transporter.sendMail({
    to: recipientEmail,
    from: 'info@joinsteward.co',
    html: renderFile(template, templateInfo),
    subject,
  });
};
