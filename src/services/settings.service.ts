import { PAYMENT_TYPE } from './../database/models/paymentType.model';
import { Product } from './../database/models/product.model';
import { getRepository } from 'typeorm';
import { ISettings } from '../database/modelInterfaces';
import { JobTitle } from '../database/models/jobTitle.model';
import { PaymentType } from '../database/models/paymentType.model';
import { findSettingsREPO } from '../database/repositories/settings.repo';
import { Sanitizer } from '../utils/sanitizer';
import Utils from '../utils/utils';
import { STEWARD_BASE_URL, SMILEID_CALLBACK_URL, CRONJOB_URI, FLUTTERWAVE_BASE_URL, MOMO_URI } from '../utils/secrets';

const settings: any = {
  TRANSACTION_FEES: {
    'credit-fees': {
      purpose: 'Fees:Business:Credit-transaction-charge',
      flat: 0,
    },
    'loan-processing-fees': {
      purpose: 'Fees:Business:Loan-processing-charge',
      flat: 0,
    },
    'debit-fees': {
      purpose: 'Fees:Business:Debit-transaction-charge',
      flat: 0,
    },
    'school-fees': {
      purpose: 'Fees:Business:School-Payment',
      percent: 0.5,
      ceiling: 8000,
      floor: 1000,
      flat: 0,
    },
    'mobile-money-fee': {
      purpose: 'Fees:Business:Mobile-Money',
      flat: 20,
    },
    'mobile-money-subscription-school-fees': {
      purpose: 'Fees:EndUser:offset-Charge',
      flat: Utils.isStaging() ? 1000 : 100000,
    },
    'steward-charge-school-fees': {
      purpose: 'Fees:EndUser:steward-Charge',
      flat: 0,
    },
    'mobile-money-collection-fees': {
      purpose: 'Fees:EndUser:collection-charge',
      // purpose: 'Fees:collection-charge',
      // percent: 1.5,
      flat: 0,
    },
  },
  DEFAULT_STUDENT_EMAIL: '@studentsteward.com',
  DEFAULT_EMAIL: '@usersteward.com',
  USSD: {
    serviceCode: Utils.isStaging() ? '*384*3124#' : '*284*76#',
    schoolServiceCode: '*384*78393#',
  },
  SCHOOL_PRODUCT: {
    tuition: 'tuition-fees',
    product: 'product',
  },
  TRANSACTION_PURPOSE: {
    'bank-transfer': {
      purpose: 'Withdraw:Bank-Transfer',
      type: 'debit',
    },
    'school-fees': {
      purpose: 'Payment:School-Fees',
      type: 'credit',
    },
    'disburse-loan': {
      purpose: 'Funding:Loan:Wallet-Top-Up',
      type: 'credit',
    },
    settlement: {
      purpose: 'Withdraw:Settlement',
      type: 'debit',
    },
    'cash-out': {
      purpose: 'Withdraw:Wallet-Cash-Out',
      type: 'debit',
    },
    'top-up': {
      purpose: 'Funding:Wallet-Top-Up',
      type: 'credit',
    },
  },
  PROVIDERS: {
    africastalking: { name: 'AFRICAS-TALKING', type: 'ussd-provider', endpoint: `${STEWARD_BASE_URL}/webhook/africastalking` },
    beyonic: { name: 'BEYONIC', type: 'payment-provider', endpoint: `${STEWARD_BASE_URL}/webhook/beyonic` },
    'smileidentity.com': { name: 'SMILEID', type: 'verifier', endpoint: SMILEID_CALLBACK_URL },
    'wemabank.com': { name: 'WEMA', type: 'payment-provider', endpoint: `${STEWARD_BASE_URL}/webhook/wema` },
    'cron-job.org': { name: 'CRON-JOB', type: 'utility-provider', endpoint: CRONJOB_URI },
    'slack.com': { name: 'SLACK', type: 'notification-provider', endpoint: 'https://slack.com/api/chat.postMessage' },
    'flutterwave.com': { name: 'FLUTTERWAVE', type: 'payment-provider', endpoint: FLUTTERWAVE_BASE_URL },
    cloudinary: { name: 'CLOUDINARY', type: 'utility-provider', endpoint: 'FUNCTION: cloudinary.uploader.upload' },
    'smtp.gmail.com': { name: 'GMAIL', type: 'notification-provider', endpoint: 'FUNCTION: nodeMailer.createTransport.sendMail' },
    'smtp.mailtrap.io': { name: 'MAILTRAP', type: 'notification-provider', endpoint: 'FUNCTION: nodeMailer.createTransport.sendMail' },
    'mtn.com': { name: 'MTN', type: 'payment-provider', endpoint: MOMO_URI },
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

const loadPaymentTypes = async () => {
  const paymentTypes = {};
  const response = await getRepository(PaymentType).find({});
  mapper(response, 'value', 'id', paymentTypes);
  settings.PAYMENT_TYPES = paymentTypes;
};

const loadFeeTypes = async () => {
  const paymentTypes = {};
  const response = await getRepository(PaymentType).find({});
  mapper(response, 'slug', 'code', paymentTypes);
  settings.FEE_TYPES = paymentTypes;
};

const loadCurrencies = async () => {
  const paymentTypes = {};
  const response = await getRepository(PaymentType).find({});
  mapper(response, 'country', 'short_code', paymentTypes);
  settings.COUNTRY_CURRENCIES = paymentTypes;
};

const Service = {
  async init(): Promise<void> {
    await Promise.all([loadSettings(), loadJobTitles(), loadPaymentTypes(), loadFeeTypes(), loadCurrencies()]);
  },

  get(key: string): any {
    loadSettings();
    return settings[key];
  },

  set(key: string, payload: any): void {
    settings[key.toUpperCase()] = payload;
  },

  settings,
};

export default Service;
