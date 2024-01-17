/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-useless-catch */
import axios from 'axios';
import { ValidationError, NotFoundError, FailedDependencyError } from '../../utils/errors';
import Utils from '../../utils/utils';

const dependency = 'cron-job.org';

export interface Schedule {
  day?: string;
  weekDay?: string;
  month?: string;
  hour?: string;
  minute?: string;
  minutes?: string[];
  timezone?: string;
}
const Service: any = {
  weekDay: {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  },

  month: {
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
  },

  METHODS: {
    GET: 0,
    POST: 1,
    PUT: 4,
    DELETE: 5,
    PATCH: 8,
  },

  cronConfig: {
    enabled: true,
    saveResponses: false,
    requestTimeout: 30,
    redirectSuccess: false,
    auth: {
      enable: false,
      user: '',
      password: '',
    },
    notification: {
      onSuccess: true,
      onDisable: true,
      onFailure: true,
    },
    requestMethod: 0,
    extendedData: {
      body: '',
      headers: {},
    },
  },

  axiosInstance: axios.create({
    baseURL: `${process.env.CRONJOB_URI}`,
    headers: {
      Authorization: `Bearer ${process.env.CRONJOB_KEY}`,
    },
  }),

  async createAJob(data: { generate: boolean; body: any; method: number; title: string; url: string; schedule: Schedule }): Promise<any> {
    const { body, method = 0, title, url, schedule, generate = true } = data;

    const generateSchedule = generate ? await Service.generateSchedule(schedule) : schedule;

    try {
      const response = await Service.axiosInstance.put('/jobs', {
        job: {
          title,
          url: `${Utils.getApiURL()}/jobs/${url}`,
          ...Service.cronConfig,
          schedule: generateSchedule,
          requestMethod: method,
          extendedData: {
            headers: {
              Authorization: `Bearer ${process.env.INTRA_SERVICE_TOKEN}`,
            },
            body: body && `data=${JSON.stringify(body)}`,
          },
        },
      });
      return response;
    } catch (error: any) {
      console.log('424: Cron Integration Error: createAJob failed', error);
      if (!error.name) throw new FailedDependencyError(error.message, dependency);
      if (error.response && error.response.status === 404) throw new NotFoundError('Cron job');
      throw error;
    }
  },

  async generateSchedule(schedule: any): Promise<any> {
    const generateSchedule: any = {
      mdays: [],
      wdays: [],
      months: [],
      hours: [],
      minutes: [],
      timezone: 'Africa/Lagos',
    };

    const { day, weekDay, month, hour, minute } = schedule;

    day === 'every' ? (generateSchedule.mdays = [-1]) : generateSchedule.mdays.concat(day);
    weekDay === 'every' ? (generateSchedule.wdays = [-1]) : generateSchedule.wdays.concat(Service.getSequence('weekDay', weekDay, 'asc'));
    month === 'every' ? (generateSchedule.months = [-1]) : generateSchedule.months.concat(Service.getSequence('month', month, 'asc'));
    hour === 'every' ? (generateSchedule.hours = [-1]) : generateSchedule.hours.concat(hour);

    if (minute.every) {
      const everyMinuteDuration: any[] = [];
      if (60 % minute.duration === 0) {
        let num = 0;

        while (num <= 60 - minute.duration) {
          everyMinuteDuration.push(num);
          num += minute.duration;
        }
        generateSchedule.minutes = everyMinuteDuration;
      } else throw new ValidationError(`every ${minute.duration} minutes is not possible`);
    } else generateSchedule.minutes = minute.duration;

    return generateSchedule;
  },

  async listJobs(): Promise<any> {
    try {
      const response = await Service.axiosInstance.get('/jobs');
      return response;
    } catch (error: any) {
      console.log('424: Cron Integration Error: listJobs failed', error);
      if (!error.name) throw new FailedDependencyError(error.message, dependency);
      if (error.response && error.response.status === 404) throw new NotFoundError('Cron job');
      throw error;
    }
  },

  async fetchJob(id: number): Promise<any> {
    try {
      const response = await Service.axiosInstance.get(`/jobs/${id}`);
      return response;
    } catch (error: any) {
      console.log('424: Cron Integration Error: fetchJob failed');
      if (!error.name) throw new FailedDependencyError(error.message, dependency);
      if (error.response && error.response.status === 404) throw new NotFoundError('Cron job');
      throw error;
    }
  },

  async deleteJob(id: number): Promise<any> {
    try {
      const response = await Service.axiosInstance.delete(`/jobs/${id}`);
      return response;
    } catch (error: any) {
      console.log('424: Cron Integration Error: deleteJob failed', error);
      if (!error.name) throw new FailedDependencyError(error.message, dependency);
      if (error.response && error.response.status === 404) throw new NotFoundError('Cron job');
      throw error;
    }
  },

  async updateJob(id: number, data: any): Promise<any> {
    try {
      const response = await Service.axiosInstance.patch(`/jobs/${id}`, data);
      return response;
    } catch (error: any) {
      console.log('424: Cron Integration Error: updateJob failed', error);
      if (!error.name) throw new FailedDependencyError(error.message, dependency);
      if (error.response && error.response.status === 404) throw new NotFoundError('Cron job');
      throw error;
    }
  },

  async fetchJobHistory(id: number): Promise<any> {
    try {
      const response = await Service.axiosInstance.get(`/jobs/${id}/history`);
      return response;
    } catch (error: any) {
      console.log('424: Cron Integration Error: fetchJobHistory failed', error);
      if (!error.name) throw new FailedDependencyError(error.message, dependency);
      if (error.response && error.response.status === 404) throw new NotFoundError('Cron job');
      throw error;
    }
  },

  async fetchJobHistoryDetails(id: number, identifier: string | number): Promise<any> {
    try {
      const response = await Service.axiosInstance.get(`/jobs/${id}/history/${identifier}`);
      return response;
    } catch (error: any) {
      console.log('424: Cron Integration Error: fetchJobHistoryDetails failed', error);
      if (!error.name) throw new FailedDependencyError(error.message, dependency);
      if (error.response && error.response.status === 404) throw new NotFoundError('Cron job');
      throw error;
    }
  },

  getSequence(sequence: string, sequenceNames: any, sortOrder = 'asc'): any {
    const sequenceNumbers: any[] = [];
    for (const sequenceName of sequenceNames) {
      sequenceNumbers.push(Service[sequence][sequenceName]);
    }
    if (sortOrder === 'asc') {
      sequenceNumbers.sort((a, b) => a - b);
    } else if (sortOrder === 'desc') {
      sequenceNumbers.sort((a, b) => b - a);
    }
    return sequenceNumbers;
  },
};

export default Service;
