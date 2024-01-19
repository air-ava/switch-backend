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

export const catchErrorsProto = async (fn: any, ...args: any[]) => {
  try {
    const result = await fn(...args);
    return result;
  } catch (error: any) {
    console.error('Error occurred:', error);
    return BadRequestException(error.message, error.data);
  }
};

export const catchIntegrationWithThirdPartyLogs = async (fn: any, errorPayload: any, ...args: any[]) => {
  try {
    const result = await fn(...args);
    return result;
  } catch (error: any) {
    const { provider, dependency, event, endpoint, method, school, payload } = errorPayload;
    const message = error.response ? error.response.statusText : error.message;
    console.log({ error, 'error.response': error.response });
    const status_code = error.response ? error.response.status : '500';

    // ? record the bad response
    saveThirdPartyLogsREPO({
      event,
      message: `${dependency}:${message}`,
      endpoint: endpoint || `${provider[dependency].endpoint}`,
      school: school.id,
      endpoint_verb: method,
      status_code: status_code || '400',
      payload: JSON.stringify({ ...payload, error }),
      provider_type: `${provider[dependency].type}`,
      provider: `${provider[dependency].name}`,
    });
    throw new FailedDependencyError(message, dependency, { school: school.name, method, event, endpoint });
  }
};

export { AuthenticationError, CustomError, ValidationError, NotFoundError, ForbiddenError, HttpStatus, ExistsError, FailedDependencyError };
