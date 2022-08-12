// eslint-disable-next-line prettier/prettier
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { findUser } from '../database/repositories/user.repo';
import { BadRequestException } from '../utils/errors';
// eslint-disable-next-line prettier/prettier
import { ControllerResponse } from '../utils/interface'
// eslint-disable-next-line prettier/prettier
import { JWT_KEY } from '../utils/secrets';

const decodeToken = (token: string): ControllerResponse & { data?: { id: string; first_name: string } } => {
  try {
    const decrypted = jwt.verify(token, JWT_KEY) as { userId: string; first_name: string };
    return { success: true, message: 'Session authenticated', data: { id: decrypted.userId, first_name: decrypted.first_name } };
  } catch (error: any) {
    return { success: false, error: (error.message === 'jwt must be provided' && error.message) || 'Invalid or expired token provided.' };
  }
};

export const validateSession: RequestHandler = async (req, res, next) => {
  const Authorization = req.headers.authorization;
  if (!Authorization) {
    return res.status(401).json({
      success: false,
      error: 'Request unauthorized',
    });
  }
  const [, token] = Authorization.split('Bearer ');
  const decodeResponse = decodeToken(token);
  if (!decodeResponse.success) {
    return res.status(401).json(decodeResponse);
  }

  const { data } = decodeResponse;
  const extractedData = data as { id: string; first_name: string };

  req.userId = String(extractedData.id);
  const user = await findUser({ id: extractedData.id }, []);
  if (!user) return BadRequestException(`Currency doesn't exists`);
  req.user = user;
  return next();
};
