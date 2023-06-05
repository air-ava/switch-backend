/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { updateSchedule } from '../database/repositories/schedule.repo';
import { NotFoundError, ValidationError, sendObjectResponse } from '../utils/errors';
import Settings from './settings.service';
import ScheduleService from './schedule.service';
import { saveSchoolSession } from '../database/repositories/schoolSession.repo';
import { STATUSES } from '../database/models/status.model';
import { listSchoolPeriod, saveSchoolPeriod } from '../database/repositories/schoolPeriod.repo';
import Utils from '../utils/utils';
import { theResponse } from '../utils/interface';
import { getEducationLevel, listEducationLevel } from '../database/repositories/education_level.repo';
import { getEducationPeriod, listEducationPeriod } from '../database/repositories/education_period.repo';

const Service = {
  async createSchoolPeriod(data: any): Promise<theResponse> {
    const { country = 'UGANDA', school, educationalSession, educationLevel: educationalCode, period: periodCode, periodSchedule } = data;
    const { schedule, startDate, expiryDate } = periodSchedule;

    // todo: check if period exists on the system
    const educationLevel = await getEducationLevel({ code: educationalCode }, []);
    if (!educationLevel) throw new NotFoundError('Educational Level');

    const foundPeriod = await getEducationPeriod({ code: periodCode }, []);
    if (!foundPeriod) throw new NotFoundError('Educational School Period');

    // todo: make sure the period is not repeating for that educational level for the session and for the school
    const periodExpiryDateTime = expiryDate && ScheduleService.combineDateTime(expiryDate.date, expiryDate.timestamp);
    if (startDate && !Utils.firstDateIsAfterSecondDate(periodExpiryDateTime, educationalSession.expiry_date))
      throw new ValidationError('Expiry Date has to be before session Expiry Date');

    const {
      data: { cronExpression, createdSchedule, isStartDateToday },
    } = await ScheduleService.validateAndInitiateScheduleRecord({ recurring: true, schedule, startDate, expiryDate });

    const periodSession = await saveSchoolPeriod({
      period: foundPeriod.feature_name,
      school_id: school.id,
      education_level: educationLevel.feature_name,
      country,
      session_id: educationalSession.id,
      schedule_id: createdSchedule.id,
      status: STATUSES.ACTIVE,
      start_date: startDate && ScheduleService.combineDateTime(startDate.date, startDate.timestamp),
      expiry_date: expiryDate && ScheduleService.combineDateTime(expiryDate.date, expiryDate.timestamp),
    });

    const scheduleRecord = await ScheduleService.generateAndRecordScheduleWithCronJob({
      createdSchedule,
      isStartDateToday,
      cronBody: {},
      cronExpression,
      startDate,
      expiryDate,
      title: `period/${periodSession.code}`,
    });
    if (!scheduleRecord.success) throw new ValidationError('Error Creating Schedule Record');

    return sendObjectResponse('School Period Created Successfully', periodSession);
  },

  async createEducationalSessions(data: any): Promise<theResponse> {
    const { name, country = 'UGANDA', session, sessionSchedule, educationLevel } = data;
    const { schedule, startDate, expiryDate } = sessionSchedule;
    const educationalLevels = Settings.get('EDUCATIOAL_LEVEL').level;

    const eduLevel = educationalLevels.filter((item: string) => item === `${educationLevel}`);
    if (!eduLevel.length) throw new NotFoundError('Education Level not found');

    const {
      data: { cronExpression, createdSchedule, isStartDateToday },
    } = await ScheduleService.validateAndInitiateScheduleRecord({ recurring: true, schedule, startDate, expiryDate });

    // Create Session Record
    const schoolSession = await saveSchoolSession({
      education_level: eduLevel[0],
      session: String(session),
      name: name || String(session),
      country,
      schedule_id: createdSchedule.id,
      status: STATUSES.ACTIVE,
      start_date: startDate && ScheduleService.combineDateTime(startDate.date, startDate.timestamp),
      expiry_date: expiryDate && ScheduleService.combineDateTime(expiryDate.date, expiryDate.timestamp),
    });

    const scheduleRecord = await ScheduleService.generateAndRecordScheduleWithCronJob({
      createdSchedule,
      isStartDateToday,
      cronBody: {},
      cronExpression,
      startDate,
      expiryDate,
      title: `session/${schoolSession.code}`,
    });
    if (!scheduleRecord.success) throw new ValidationError('Error Creating Schedule Record');

    return sendObjectResponse('Education Session Created Successfully', schoolSession);
  },

  async listPeriods(data: any): Promise<theResponse> {
    const existingEducationalPeriods = await listEducationPeriod({}, []);
    return sendObjectResponse('Educational periods retrieved successfully', existingEducationalPeriods);
  },
  
  async listSchoolPeriods(data: any): Promise<theResponse> {
    const existingSchoolPeriods = await listSchoolPeriod({}, []);
    return sendObjectResponse('School periods retrieved successfully', existingSchoolPeriods);
  },

  async listEducationalLevels(data: any): Promise<theResponse> {
    const existingEducationalLevels = await listEducationLevel({}, []);
    return sendObjectResponse('Educational levels retrieved successfully', existingEducationalLevels);
  },
};

export default Service;
