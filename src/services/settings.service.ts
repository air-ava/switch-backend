import { ISettings } from '../database/modelInterfaces';
import { findSettingsREPO } from '../database/repositories/settings.repo';

const settings: { [key: string]: string } = {};
const loadSettings = async () => {
  const foundSettings = await findSettingsREPO({}, []);
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
