import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

function throwIfUndefined(secret: string): string {
  if (!process.env[secret]) {
    logger.error(`Please set ${secret} environment variable`);
    process.exit(1);
  }
  return process.env[secret] as string;
}

export const PORT = throwIfUndefined('PORT');
// export const USER_GATEWAY_PORT = throwIfUndefined('USER_GATEWAY_PORT');
export const JWT_KEY = throwIfUndefined('JWT_KEY');
export const NODE_ENV = throwIfUndefined('NODE_ENV');
export const ENVIRONMENT = throwIfUndefined('ENVIRONMENT');
export const AFRICA_TALKING_API_KEY = throwIfUndefined('AFRICA_TALKING_API_KEY');
export const AFRICA_TALKING_USERNAME = throwIfUndefined('AFRICA_TALKING_USERNAME');

export const DB_NAME = throwIfUndefined('DB_NAME');
export const DB_HOST = throwIfUndefined('DB_HOST');
export const DB_USERNAME = throwIfUndefined('DB_USERNAME');
export const DB_PORT = throwIfUndefined('DB_PORT');
// export const DB_PASSWORD = throwIfUndefined('DB_PASSWORD');
export const BASE_URL = throwIfUndefined('BASE_URL');
export const MAILTRAP_USER = throwIfUndefined('MAILTRAP_USER');
export const MAILTRAP_PASS = throwIfUndefined('MAILTRAP_PASS');
export const MAILTRAP_PORT = throwIfUndefined('MAILTRAP_PORT');
export const MAILTRAP_HOST = throwIfUndefined('MAILTRAP_HOST');
export const FLUTTERWAVE_ENCRYPTION_KEY = throwIfUndefined('FLUTTERWAVE_ENCRYPTION_KEY');
export const FLUTTERWAVE_BASE_URL = throwIfUndefined('FLUTTERWAVE_BASE_URL');
export const FLUTTERWAVE_SECRET_KEY = throwIfUndefined('FLUTTERWAVE_SECRET_KEY');
export const BAYONIC_BASE_URL = throwIfUndefined('BAYONIC_BASE_URL');
export const BAYONIC_KEY = throwIfUndefined('BAYONIC_KEY');
export const STEWARD_BASE_URL = throwIfUndefined('STEWARD_BASE_URL');
export const AFRICA_TALKING_USSD_TOKEN = throwIfUndefined('AFRICA_TALKING_USSD_TOKEN');
export const SLACK_TOKEN = throwIfUndefined('SLACK_TOKEN');
export const CRON_TOKEN = throwIfUndefined('CRON_TOKEN');

export const REDIS_URL = throwIfUndefined('REDIS_URL');
export const AMQP_CLIENT = throwIfUndefined('AMQP_CLIENT');

export const WEMA_ACCOUNT_PREFIX = throwIfUndefined('WEMA_ACCOUNT_PREFIX');
export const WEMA_BANK_BASE_URL = throwIfUndefined('WEMA_BANK_BASE_URL');
export const WEMA_VENDOR_ID = throwIfUndefined('WEMA_VENDOR_ID');
export const WEMA_ENCRYPTION_KEY = throwIfUndefined('WEMA_ENCRYPTION_KEY');
export const WEMA_ENCRYPTION_IV = throwIfUndefined('WEMA_ENCRYPTION_IV');
export const WEMA_USERNAME = throwIfUndefined('WEMA_USERNAME');
export const WEMA_PASSWORD = throwIfUndefined('WEMA_PASSWORD');
export const STEWARD_WEMA_ACCOUNT_NAME = throwIfUndefined('STEWARD_WEMA_ACCOUNT_NAME');
export const STEWARD_WEMA_ACCOUNT_NUMBER = throwIfUndefined('STEWARD_WEMA_ACCOUNT_NUMBER');
export const WEMA_TOKEN = throwIfUndefined('WEMA_TOKEN');

export const SMILEID_API_KEY = throwIfUndefined('SMILEID_API_KEY');
export const SMILEID_PARTNER_ID = throwIfUndefined('SMILEID_PARTNER_ID');
export const SMILEID_URL = throwIfUndefined('SMILEID_URL');
export const SMILEID_CALLBACK_URL = throwIfUndefined('SMILEID_CALLBACK_URL');
export const SMILEID_ENV = throwIfUndefined('SMILEID_ENV');

export const CRONJOB_URI = throwIfUndefined('CRONJOB_URI');
export const MOMO_URI = throwIfUndefined('MOMO_URI');
// Core Proto Server Details
export const PROTO_LOCATION = throwIfUndefined('PROTO_LOCATION');
export const SERVICE_IP = throwIfUndefined('SERVICE_IP');
export const SERVICE_PORT = throwIfUndefined('SERVICE_PORT');

// Core Proto Payment Server Details
export const PAYMENTS_SERVICE_IP = throwIfUndefined('PAYMENTS_SERVICE_IP');
export const PAYMENTS_SERVICE_PORT = throwIfUndefined('PAYMENTS_SERVICE_PORT');
