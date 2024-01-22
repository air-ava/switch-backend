// eslint-disable-next-line prettier/prettier
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { getOneOrganisationREPO } from '../database/repositories/organisation.repo';
import { getSchool } from '../database/repositories/schools.repo';
import { findUser } from '../database/repositories/user.repo';
import BackOfficeUserRepo from '../database/repositories/backOfficeUser.repo';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
// eslint-disable-next-line prettier/prettier
import { ControllerResponse } from '../utils/interface'
// eslint-disable-next-line prettier/prettier
import { JWT_KEY } from '../utils/secrets';
import { jwtDecodedDTO, jwtDTO } from '../dto/helper.dto';
import { getSchoolSession } from '../database/repositories/schoolSession.repo';
import { getStudentGuardian } from '../database/repositories/studentGuardian.repo';
import Settings from '../services/settings.service';

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

  async getGuardianSessionData(data: jwtDecodedDTO & { originalUrl: string }): Promise<any> {
    const { id, originalUrl } = data;
    if (!originalUrl.includes('/guardians/')) throw Error(`Invalid token provided`);

    const studentGuardian = await getStudentGuardian(
      { id },
      [],
      ['Guardian', 'student', 'student.School', 'student.School.Organisation', 'Guardian.phoneNumber'],
    );
    if (!studentGuardian) throw Error(`Guardian does not exist`);
    const { student, Guardian } = studentGuardian;
    if (Guardian.type !== 'guardian') throw Error(`Guardian does not exist`);
    const { School: school } = student as any;
    const { Organisation: organisation } = school as any;
    const payload = { individual: Guardian, school, organisation };
    delete (student as any).School;
    return { ...payload, student };
  },

  async getDashboardSessionData(data: jwtDecodedDTO & { originalUrl: string }): Promise<any> {
    const { id, originalUrl } = data;
    if (!originalUrl.includes('/api/')) throw Error(`Invalid token provided`);

    return sessionData.getDashboardData({ id });
  },

  async getDashboardData(data: any): Promise<any> {
    const { id } = data;
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
    if (!decodeResponse.success) return res.status(401).json(decodeResponse);

    const { data } = decodeResponse;
    const extractedData = data as jwtDecodedDTO;

    req.userId = String(extractedData.id);
    req.deviceInfo = req.useragent;
    req.ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    const sessionDataPayload = { ...extractedData, originalUrl: req.originalUrl };
    if (extractedData.type === 'backOffice') {
      // New
      const { user: foundUser } = await sessionData.getBackOfficeSessionData(sessionDataPayload);
      req.backOfficeUser = foundUser;
      Settings.set('USER', foundUser);
    } else if (extractedData.type === 'guardian') {
      const { individual, school, organisation, student } = await sessionData.getGuardianSessionData(sessionDataPayload);
      req.guardian = individual;
      req.school = school;
      req.organisation = organisation;
      req.student = student;

      Settings.set('SCHOOL', school);
      Settings.set('COUNTRY', school.country.toUpperCase());
      Settings.set('GUARDIAN', individual);
      Settings.set('ORGANISATION', organisation);
      Settings.set('STUDENT', student);
    } else {
      // New
      const { user: foundUser, school: foundSchool, organisation: foundOrganisation } = await sessionData.getDashboardSessionData(sessionDataPayload);
      req.user = foundUser;
      req.organisation = foundOrganisation;
      req.school = foundSchool;
      const session = await getSchoolSession({ country: 'UGANDA' || foundSchool.country.toUpperCase(), status: STATUSES.ACTIVE }, []);
      req.educationalSession = session;
      const wallet = await WalletREPO.findWallet({ userId: foundUser.id, entity: 'school', entity_id: foundSchool.id }, []);
      if (wallet) Settings.set('WALLET', wallet);

      Settings.set('SCHOOL', foundSchool);
      Settings.set('COUNTRY', foundSchool.country.toUpperCase());
      Settings.set('SESSION', session);
      Settings.set('ORGANISATION', foundOrganisation);
      Settings.set('USER', foundUser);

      // TODO: Get all running periods for the Schools across multiple education Levels
    }
    return next();
  } catch (error: any) {
    return error.message
      ? res.status(400).json({ success: false, error: error.message })
      : res.status(500).json({ success: false, error: 'Error with Session Validation', data: error });
  }
};

export default sessionData;
