import { RequestHandler } from 'express';
import { ForbiddenError } from '../utils/errors';

export const cronMiddleware: RequestHandler = async (req, res, next) => {
  if (req.headers.authorization === `Bearer ${process.env.CRON_TOKEN}`) return next();
  throw new ForbiddenError('You cannot carry out this action');
};
