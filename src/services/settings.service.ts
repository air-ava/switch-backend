import { getRepository } from 'typeorm';
import { ISettings } from '../database/modelInterfaces';
import { JobTitle } from '../database/models/jobTitle.model';
import { findSettingsREPO } from '../database/repositories/settings.repo';
import { Sanitizer } from '../utils/sanitizer';

const settings: any = {};

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
    return settings[key];
  },

  settings,
};

export default Service;
