import { getRepository } from 'typeorm';
import { ISettings } from '../database/modelInterfaces';
import { JobTitle } from '../database/models/jobTitle.model';
import { findSettingsREPO } from '../database/repositories/settings.repo';
import { Sanitizer } from '../utils/sanitizer';

const settings: any = {
  TRANSACTION_FEES: {
    'credit-fees': {
      purpose: 'Fees:Credit',
      flat: 0,
    },
    'debit-fees': {
      purpose: 'Fees:Debit',
      percent: 0.5,
      ceiling: 5000,
    },
    'school-fees': {
      purpose: 'Fees:School-Payment',
      percent: 0.5,
      ceiling: 8000,
      floor: 1000,
      flat: 0,
    },
    'mobile-money-fee': {
      purpose: 'Fees:Mobile-Money',
      flat: 20,
    },
  },
  DEFAULT_STUDENT_EMAIL: '@studentsteward.com',
  DEFAULT_EMAIL: '@usersteward.com',
  USSD: {
    serviceCode: '*384*3124#',
  }
};

// eslint-disable-next-line consistent-return
const mapper = (payload: { [key: string]: any }, key: string, value: string, response: any) => {
  if (!Array.isArray(payload)) return Sanitizer.jsonify(payload);
  payload.forEach((item) => {
    const data = Sanitizer.jsonify(item);
    response[data[key]] = data[value];
    return response;
  });
};

const loadSettings = async () => {
  const foundSettings = await findSettingsREPO({}, []);
  foundSettings.forEach((setting: ISettings) => {
    settings[setting.key] = JSON.parse(JSON.stringify(setting.value));
  });

  return settings;
};

const loadJobTitles = async () => {
  const jobTitles = {};
  const response = await getRepository(JobTitle).find({});
  mapper(response, 'name', 'id', jobTitles);
  settings.JOB_TITLES = jobTitles;
};

const Service = {
  async init(): Promise<void> {
    await Promise.all([loadSettings(), loadJobTitles()]);
  },
  get(key: string): any {
    loadSettings();
    return settings[key];
  },

  settings,
};

export default Service;
