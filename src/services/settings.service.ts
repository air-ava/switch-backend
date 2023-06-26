import { PAYMENT_TYPE } from './../database/models/paymentType.model';
import { Product } from './../database/models/product.model';
import { getRepository } from 'typeorm';
import { ISettings } from '../database/modelInterfaces';
import { JobTitle } from '../database/models/jobTitle.model';
import { PaymentType } from '../database/models/paymentType.model';
import { findSettingsREPO } from '../database/repositories/settings.repo';
import { Sanitizer } from '../utils/sanitizer';
import Utils from '../utils/utils';

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
    'mobile-money-subscription-school-fees': {
      purpose: 'Fees:offset-Charge',
      flat: Utils.isStaging() ? 10 : 1000,
    },
    'steward-charge-school-fees': {
      purpose: 'Fees:steward-Charge',
      // flat: 200,
      flat: 0,
    },
    'mobile-money-collection-fees': {
      purpose: 'Fees:collection-charge',
      // percent: 1.5,
      flat: 0,
    },
  },
  DEFAULT_STUDENT_EMAIL: '@studentsteward.com',
  DEFAULT_EMAIL: '@usersteward.com',
  USSD: {
    serviceCode: Utils.isStaging() ? '*384*3124#' : '*284*76#',
  },
  SCHOOL_PRODUCT: {
    tuition: 'tuition-fees',
    product: 'product',
  },
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

const loadPaymentTypes = async () => {
  const paymentTypes = {};
  const response = await getRepository(PaymentType).find({});
  mapper(response, 'value', 'id', paymentTypes);
  settings.PAYMENT_TYPES = paymentTypes;
};

const Service = {
  async init(): Promise<void> {
    await Promise.all([loadSettings(), loadJobTitles(), loadPaymentTypes()]);
  },
  get(key: string): any {
    loadSettings();
    return settings[key];
  },

  settings,
};

export default Service;
