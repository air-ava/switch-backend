import { getRepository } from 'typeorm';
import { ISettings } from '../database/modelInterfaces';
import { Settings } from '../database/models/settings.model';
import { STATUSES } from '../database/models/status.model';
import { getOneSettingsREPO } from '../database/repositories/settings.repo';

const settings: { [key: string]: string } = {};
const loadSettings = async () => {
  //   (await getRepository(Settings).find())

  const foundSettings = await getOneSettingsREPO({}, []);

  foundSettings.forEach((setting: ISettings) => {
    settings[setting.key] = JSON.parse(JSON.stringify(setting.value));
  });

  return settings;
};

const Service = {
  async init(): Promise<void> {
    await loadSettings();
  },
  get(key: string): any {
    return settings[key];
  },

  settings,
};

export default Service;
