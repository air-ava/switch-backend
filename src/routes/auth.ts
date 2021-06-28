import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ControllerResponse } from '../utils/interface'
import { JWT_KEY } from '../utils/secrets';

const decodeToken = (token: string): ControllerResponse & { data?: { id: string } } => {
  try {
    const decrypted = jwt.verify(token, JWT_KEY) as { sub: string };
    return { success: true, message: 'Session authenticated', data: { id: decrypted.sub } };
  } catch (error) {
    return { success: false, error: 'Invalid or expired token provided.' };
  }
};

export const validateSession: RequestHandler = (req, res, next) => {
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

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  // req.userId = Number(decodeResponse.data!.id);
  return next();
};
