/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
// eslint-disable-next-line max-classes-per-file

import { Channel, ConsumeMessage } from 'amqplib';
import AuthenticationError from './authenticationError';
import CustomError from './customError';
import ExistsError from './existsError';
import FailedDependencyError from './failedDependencyError';
import ForbiddenError from './forbiddenError';
import HttpStatus from './httpStatus';
import { Log, log } from './logs';
import NotFoundError from './notFounfError';
import ValidationError from './validationError';
import logger from './logger';
import { saveThirdPartyLogsREPO } from '../database/repositories/thirdParty.repo';
import { CRONJOB_URI, FLUTTERWAVE_BASE_URL, MOMO_URI, SMILEID_CALLBACK_URL, STEWARD_BASE_URL } from './secrets';

const provider: any = {
  africastalking: { name: 'AFRICAS-TALKING', type: 'ussd-provider', endpoint: `${STEWARD_BASE_URL}/webhook/africastalking` },
  beyonic: { name: 'BEYONIC', type: 'payment-provider', endpoint: `${STEWARD_BASE_URL}/webhook/beyonic` },
  'smileidentity.com': { name: 'SMILEID', type: 'verifier', endpoint: SMILEID_CALLBACK_URL },
  'wemabank.com': { name: 'WEMA', type: 'payment-provider', endpoint: `${STEWARD_BASE_URL}/webhook/wema` },
  'cron-job.org': { name: 'CRON-JOB', type: 'utility-provider', endpoint: CRONJOB_URI },
  'slack.com': { name: 'SLACK', type: 'notification-provider', endpoint: 'https://slack.com/api/chat.postMessage' },
  'flutterwave.com': { name: 'FLUTTERWAVE', type: 'payment-provider', endpoint: FLUTTERWAVE_BASE_URL },
  cloudinary: { name: 'CLOUDINARY', type: 'utility-provider', endpoint: 'FUNCTION: cloudinary.uploader.upload' },
  'smtp.gmail.com': { name: 'GMAIL', type: 'notification-provider', endpoint: 'FUNCTION: nodeMailer.createTransport.sendMail' },
  'smtp.mailtrap.io': { name: 'MAILTRAP', type: 'notification-provider', endpoint: 'FUNCTION: nodeMailer.createTransport.sendMail' },
  'mtn.com': { name: 'MTN', type: 'payment-provider', endpoint: MOMO_URI },
};

const methods: any = {
  0: 'GET',
  1: 'POST',
  2: 'PUT',
  3: 'DELETE',
  4: 'PATCH',
};

export const BadRequestError = (error: string) => {
  console.log(error);
  return {
    error,
    data: null,
    success: false,
  };
};

export const ResourceNotFoundError = (errors: { message: any }) => {
  console.log(errors);
  return {
    error: errors.message,
    success: false,
    data: null,
  };
};

export const sendObjectResponse = (message: string, data?: any): { success: boolean; message: string; data?: any } => {
  return {
    success: true,
    message,
    data,
  };
};

export const oldSendObjectResponse = (message: string, data?: any, old = false): { status: boolean; message: string; data?: any } => {
  return {
    status: true,
    message,
    ...(!old && {
      ...(Array.isArray(data) && { data }),
      ...(!Array.isArray(data) && { ...data }),
    }),
    ...(old && { data }),
  };
};

export const BadRequestException = (error: string, data?: any): { success: boolean; error: string; data?: any } => {
  const newErr = typeof data === 'object' && JSON.stringify(data);
  // log(Log.fg.yellow, newErr);
  return {
    success: false,
    error,
    data,
  };
};

export const wemaAccountResponse = (status = '07', message: string, data?: any): { status: string; status_desc: string; data?: any } => {
  return {
    status,
    status_desc: message,
    ...data,
  };
};

export const consumerResponse = (message: string, channel: Channel, load: ConsumeMessage): void => {
  logger.info(message);
  channel.ack(load);
  // eslint-disable-next-line no-useless-return
  return;
};
export const consumerException = (message: string, queueLoad?: { channel: Channel; load: ConsumeMessage }): void => {
  logger.error(message);
  if (queueLoad) {
    const { channel, load } = queueLoad;
    channel.ack(load);
  }
  // eslint-disable-next-line no-useless-return
  return;
};

export const catchErrors = (fn: any) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch((err: { status?: number; message?: string; data?: any }) => {
      console.log({ err });
      const { status = 500, message = 'Internal Server Error', data = null } = err;
      res.status(status).json({ success: false, error: message, data });
    });
  };
};

export const catchWemaWebhookErrors = (fn: any) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch((err: { status?: number; message?: string; data?: any }) => {
      console.log({ err });
      const { status = 400, message = 'Internal Server Error', data = null } = err;
      res.status(status).json({ status: '07', success: false, status_desc: message, data });
    });
  };
};

export const catchWebhookErrors = (fn: any) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch((err: { status?: number; message?: string; data?: any }) => {
      console.log({ 'Error occurred:': err });
      const { status = 200 } = err;
      res.status(status).json({ success: false, error: err }).end();
    });
  };
};

export const catchErrorsWithLogs = async (fn: any, ...args: any[]) => {
  try {
    return fn(...args);
  } catch (error: any) {
    console.error('Error occurred:', error);
    throw error;
  }
};

export const catchIntegrationWithThirdPartyLogs = async (fn: any, ...args: any[]) => {
  try {
    console.log({ ...args });
    return fn(...args);
  } catch (error: any) {
    console.error('Error occurred response:', error.response);
    console.error('Error occurred dependency:', error.dependency);
    console.error('Error occurred message:', error.message);
    console.error('Error occurred event:', error.event);
    console.error('Error occurred school:', error.school);
    console.error('Error occurred method:', error.method);
    saveThirdPartyLogsREPO({
      event: `${error.event}`,
      message: `${error.dependency}:${error.message}`,
      endpoint: `${error.endpoint ? error.endpoint : provider[error.dependency].endpoint}`,
      school: error.school.id,
      endpoint_verb: methods[error.method],
      status_code: '200',
      payload: JSON.stringify(error.payload),
      provider_type: `${provider[error.dependency].type}`,
      provider: `${provider[error.dependency].name}`,
    });
    throw error;
  }
};

export { AuthenticationError, CustomError, ValidationError, NotFoundError, ForbiddenError, HttpStatus, ExistsError, FailedDependencyError };
