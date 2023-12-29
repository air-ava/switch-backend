import { RequestHandler } from 'express';
import { AuthenticationError, ForbiddenError } from '../utils/errors';
import { CRON_TOKEN, JWT_KEY, WEMA_TOKEN } from '../utils/secrets';
import { jwtDecodedDTO } from '../dto/helper.dto';
import { decodeToken } from '../utils/jwt';

export const cronMiddleware: RequestHandler = async (req, res, next) => {
  if (req.headers.authorization === `Bearer ${CRON_TOKEN}`) return next();
  throw new ForbiddenError('You cannot carry out this action');
};

export const wemaMiddleware: RequestHandler = async (req, res, next) => {
  const bearer = req.headers.authorization;
  if (bearer !== `Bearer ${WEMA_TOKEN}`) throw new AuthenticationError('Invalid authorization');
  const [, token] = bearer.split('Bearer ');

  const decodeResponse = decodeToken(token, JWT_KEY);
  if (!decodeResponse.success) throw new AuthenticationError('Invalid authorization');

  const { data } = decodeResponse;
  const extractedData = data as jwtDecodedDTO;

  if (extractedData.type !== 'wema') throw new AuthenticationError('Invalid authorization');

  return next();
};
