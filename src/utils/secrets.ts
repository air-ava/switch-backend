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
