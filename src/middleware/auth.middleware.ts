// eslint-disable-next-line prettier/prettier
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { IOrganisation, IUser } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { getOneOrganisationREPO } from '../database/repositories/organisation.repo';
import { getSchool } from '../database/repositories/schools.repo';
import { findUser } from '../database/repositories/user.repo';
import BackOfficeUserRepo from '../database/repositories/backOfficeUser.repo';
import { BadRequestException } from '../utils/errors';
// eslint-disable-next-line prettier/prettier
import { ControllerResponse } from '../utils/interface'
// eslint-disable-next-line prettier/prettier
import { JWT_KEY } from '../utils/secrets';
import { jwtDecodedDTO, jwtDTO } from '../dto/helper.dto';
import { getSchoolSession } from '../database/repositories/schoolSession.repo';

const decodeToken = (token: string): ControllerResponse & { data?: jwtDecodedDTO } => {
  try {
    const { userId, first_name, name, type } = jwt.verify(token, JWT_KEY) as jwtDTO;
    return {
      success: true,
      message: 'Session authenticated',
      data: { id: userId, first_name, name, type },
    };
  } catch (error: any) {
    return { success: false, error: (error.message === 'jwt must be provided' && error.message) || 'Invalid or expired token provided.' };
  }
};

const sessionData = {
  async getBackOfficeSessionData(data: jwtDecodedDTO & { originalUrl: string }): Promise<any> {
    const { id, originalUrl } = data;
    if (!originalUrl.includes('/office/')) throw Error(`Invalid token provided`);

    const user = await BackOfficeUserRepo.findBackOfficeUser({ id }, []);
    if (!user) throw Error(`User admin does not exist`);
    return { user };
  },

  async getDashboardSessionData(data: jwtDecodedDTO & { originalUrl: string }): Promise<any> {
    const { id, originalUrl } = data;
    if (!originalUrl.includes('/api/')) throw Error(`Invalid token provided`);

    const user = await findUser({ id }, []);
    if (!user) throw Error(`User doesn't exists`);
    const organisation = await getOneOrganisationREPO({ id: (user as IUser).organisation }, []);
    let school;
    if (organisation) {
      if (organisation) {
        school = await getSchool({ organisation_id: organisation.id }, [], ['Logo']);
        if (school) school = school as any;
      }
    }

    return { user, organisation, school };
  },
};

export const validateSession: RequestHandler = async (req, res, next) => {
  try {
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
    const extractedData = data as jwtDecodedDTO;

    req.userId = String(extractedData.id);

    const sessionDataPayload = { ...extractedData, originalUrl: req.originalUrl };
    if (extractedData.type === 'backOffice') {
      // New
      const { user: foundUser } = await sessionData.getBackOfficeSessionData(sessionDataPayload);
      req.backOfficeUser = foundUser;
    } else {
      // New
      const { user: foundUser, school: foundSchool, organisation: foundOrganisation } = await sessionData.getDashboardSessionData(sessionDataPayload);
      req.user = foundUser;
      req.organisation = foundOrganisation;
      req.school = foundSchool;
      // Todo: Get current Educational Session Data
      req.educationalSession = await getSchoolSession({ country: 'UGANDA' || foundSchool.country.toUpperCase(), status: STATUSES.ACTIVE }, []);
      // TODO: Get all running periods for the Schools across multiple education Levels
    }
    return next();
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Error with Session Validation', data: error });
  }
};
