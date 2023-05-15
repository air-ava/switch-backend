import { sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import CronIntegrator, { Schedule } from '../integrations/extra/cron.integrations';

const Service = {
  async addCron(title: string, schedule: Schedule & { url: string }): Promise<theResponse> {
    const { url = null, ...rest } = schedule;
    const createdCron = await CronIntegrator.createAJob({
      title: title.toLowerCase(),
      url: url || title.toLowerCase(),
      schedule: rest,
    });

    return sendObjectResponse('Crons created Successfully', createdCron.data);
  },

  async listCron(): Promise<theResponse> {
    const gottenJobs = await CronIntegrator.listJobs();
    return sendObjectResponse('Crons list retrieved Successfully', gottenJobs.data);
  },

  async getCron(jobId: string | number): Promise<theResponse> {
    const gottenJob = await CronIntegrator.fetchJob(jobId);
    return sendObjectResponse('Cron retrieved Successfully', gottenJob.data.jobDetails);
  },

  async updateCron(jobId: string | number, data: any): Promise<theResponse> {
    const { activate, ...rest } = data;
    await CronIntegrator.updateJob(jobId, {
      job: {
        enabled: activate,
        ...rest,
      },
    });
    return sendObjectResponse('Cron updated Successfully');
  },

  async deleteCron(jobId: string | number): Promise<theResponse> {
    await CronIntegrator.deleteJob(jobId);
    return sendObjectResponse('Cron deleted Successfully');
  },

  async cronHistory(jobId: string | number): Promise<theResponse> {
    const gottenJob = await CronIntegrator.fetchJobHistory(jobId);
    return sendObjectResponse('Cron History retrieved Successfully', gottenJob.data);
  },
};

export default Service;
