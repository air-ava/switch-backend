// eslint-disable-next-line import/no-extraneous-dependencies
import CronParser from 'cron-parser';
import { theResponse } from '../utils/interface';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-unused-expressions */
import { STATUSES } from '../database/models/status.model';
import { saveSchedule, updateSchedule } from '../database/repositories/schedule.repo';
import { sendObjectResponse, ValidationError } from '../utils/errors';
import Utils from '../utils/utils';
import CronIntegrator from '../integrations/extra/cron.integrations';

interface cronExpressionDTO {
  minutes?: string | number;
  hours?: string | number;
  dayOfMonth?: string | number;
  month?: string | number;
  dayOfWeek?: string | number;
}

const Service = {
  convertMonthToNumber(month: string): any {
    const monthMap: any = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    };
    return monthMap[month.toLowerCase()];
  },

  convertDayOfWeekToNumber(dayOfWeek: string): any {
    const dayOfWeekMap: any = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    return dayOfWeekMap[dayOfWeek.toLowerCase()];
  },

  generateCronExpression({ minutes, hours, dayOfMonth, month, dayOfWeek }: cronExpressionDTO): any {
    const cronExpression = [];

    // Minutes
    minutes ? cronExpression.push(minutes) : cronExpression.push('*');
    // Hours
    hours ? cronExpression.push(hours) : cronExpression.push('*');
    // Day of Month
    dayOfMonth ? cronExpression.push(dayOfMonth) : cronExpression.push('*');

    // Month
    if (month !== undefined) {
      const monthNumber = Service.convertMonthToNumber(String(month));
      cronExpression.push(monthNumber);
    } else cronExpression.push('*');

    // Day of Week
    if (dayOfWeek !== undefined) {
      const dayOfWeekNumber = Service.convertDayOfWeekToNumber(String(dayOfWeek));
      cronExpression.push(dayOfWeekNumber);
    } else cronExpression.push('*');

    return cronExpression.join(' ');
  },

  generateCronExpressionAndNextTriggerDate(readableInput: cronExpressionDTO): any {
    const expression = Service.generateCronExpression(readableInput);

    // Validate and parse the cron expression
    const interval = CronParser.parseExpression(expression);

    // Get the next trigger date
    const nextDate = interval.next();
    const prevDate = interval.prev();

    return {
      expression,
      prevDate: prevDate.toString(),
      nextDate: nextDate.toString(),
      hasNext: interval.hasNext(),
    };
  },

  async validateAndInitiateScheduleRecord({ recurring = true, schedule, startDate, expiryDate }: any): Promise<theResponse> {
    if (!recurring && !startDate) throw new ValidationError('Start Date has to be added for a schedule');
    if (!recurring && expiryDate) throw new ValidationError('Expiry Date not needed for a schedule');

    // checks if startDate is not today or not
    const isStartDateToday = startDate && Utils.isDateToday(startDate.date);
    const startDateTime = startDate && Service.combineDateTime(startDate.date, startDate.timestamp);
    // Check if startDate is ahead of current time and before the expiry Date
    if (startDate && !Utils.firstDateIsAfterSecondDate(startDateTime)) throw new ValidationError('Start Date has to be ahead of current date');
    if (startDate && expiryDate && !Utils.firstDateIsBeforeSecondDate(startDateTime, Service.combineDateTime(expiryDate.date, expiryDate.timestamp)))
      throw new ValidationError('Start Date has to be ahead of Expiry Date');

    // generate cron expression
    const cronExpression = Service.generateCronExpressionAndNextTriggerDate(schedule);
    // create schedule on schedule table
    const createdSchedule = await saveSchedule({
      cron_expression: String(cronExpression.expression),
      status: isStartDateToday ? STATUSES.INACTIVE : STATUSES.ACTIVE,
    });

    return sendObjectResponse('Schedule Initialized', {
      cronExpression,
      createdSchedule,
      isStartDateToday,
      startDateTime,
    });
  },

  async generateAndRecordScheduleWithCronJob({ createdSchedule, isStartDateToday, cronBody, cronExpression, startDate, expiryDate, title }: any) {
    const generateSchedule = Service.createScheduleFromCronExpression(cronExpression.expression);

    const createdCron = await CronIntegrator.createAJob({
      generate: false,
      title,
      url: title,
      method: CronIntegrator.METHODS.POST,
      body: cronBody,
      schedule: {
        ...generateSchedule,
        timezone: 'Africa/Lagos',
        enabled: startDate ? isStartDateToday : true,
        expiresAt: expiryDate ? Service.formatDateString({ date: expiryDate.date, timestamp: expiryDate.timestamp }) : 0,
      },
    });

    // Update Schedule Table with CronId
    await updateSchedule({ id: createdSchedule.id }, { cron_id: createdCron.data.jobId });

    return sendObjectResponse('Get Expression Schedule', {
      createdCron: createdCron.data,
      cronExpression,
      createdSchedule,
    });
  },

  async createScheduledRecord({ cronBody, recurring = true, schedule, startDate, expiryDate, title }: any): Promise<theResponse> {
    const {
      data: { cronExpression, createdSchedule, isStartDateToday },
    } = await Service.validateAndInitiateScheduleRecord({ recurring, schedule, startDate, expiryDate });

    const {
      data: { createdCron, generateSchedule },
    } = await Service.generateAndRecordScheduleWithCronJob({
      createdSchedule,
      isStartDateToday,
      cronBody,
      cronExpression,
      startDate,
      expiryDate,
      title,
    });

    return sendObjectResponse('Get Expression Schedule', {
      createdCron: createdCron.data,
      cronExpression,
      createdSchedule,
      generateSchedule,
    });
  },

  formatDateString({ date, timestamp }: { date: string; timestamp: string }) {
    // timestamp(hh:mm:ss) is in 24hrs and it stops in seconds
    // date(yyyy-mm:-dd)
    const chosenDate = Service.combineDateTime(date, timestamp);
    const formattedString = chosenDate
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14);

    // returns this format of date YYYYMMDDhhmmss
    return formattedString;
  },

  combineDateTime(date: any, time: any) {
    const combinedDateTime = new Date(`${date}T${time}`);
    return combinedDateTime;
  },

  createScheduleFromCronExpression(cronExpression: string) {
    const cronFields = cronExpression.split(' ');
    const [minutes, hours, mdays, months, wdays] = cronFields.map((field: any) => Service.parseCronField(field));

    return {
      hours,
      mdays,
      minutes,
      months,
      wdays,
    };
  },

  parseCronField(field: string) {
    if (field === '*') return [-1];
    if (field.includes(',')) return field.split(',').map((value: string) => parseInt(value, 10));
    if (field.startsWith('*/')) {
      const step = parseInt(field.slice(2), 10);
      const max = Service.getMaxValueForField(field);
      const values = [];
      for (let i = 1; i <= max; i += step) {
        values.push(i);
      }
      return values;
    }
    return [parseInt(field, 10)];
  },

  getMaxValueForField(field: string) {
    const fieldType = field.charAt(0);
    switch (fieldType) {
      case '*':
        return Service.getDefaultMaxValue(field);
      case '/':
        return parseInt(field.slice(2), 10);
      default:
        return parseInt(field, 10);
    }
  },

  getDefaultMaxValue(field: string) {
    const fieldType = field.charAt(0);
    switch (fieldType) {
      case '0':
        return 59; // minutes field
      case '1':
        return 23; // hours field
      case '2':
        return 31; // month days field
      case '3':
        return 12; // months field
      case '4':
        return 6; // week days field (0-6, Sunday to Saturday)
      default:
        return 0; // default value
    }
  },
};

export default Service;
