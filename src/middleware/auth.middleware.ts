import { IOrganisation } from './../database/modelInterfaces';
// eslint-disable-next-line prettier/prettier
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { getOneOrganisationREPO } from '../database/repositories/organisation.repo';
import { getSchool } from '../database/repositories/schools.repo';
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
  if (!user) return BadRequestException(`User doesn't exists`);
  const organisation = await getOneOrganisationREPO({ id: (user as IUser).organisation }, []);
  if (organisation) {
    req.organisation = organisation as any;
    if (organisation) {
      const school = await getSchool({ organisation_id: organisation.id }, []);
      if (school) req.school = school as any;
    }
  }

  req.user = user;
  return next();
};
