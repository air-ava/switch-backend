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

export const BadRequestError = (error: string) => {
  console.log(error);
  return {
    error,
    success: false,
    data: null,
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

export const invalidAccountResponse = (status = '07', message: string, data?: any): { status: string; status_desc: string; data?: any } => {
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
export const consumerException = (message: string, queueLoad?: { channel: Channel, load: ConsumeMessage }): void => {
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

export { AuthenticationError, CustomError, ValidationError, NotFoundError, ForbiddenError, HttpStatus, ExistsError, FailedDependencyError };
