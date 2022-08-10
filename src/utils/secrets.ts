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

export const DB_NAME = throwIfUndefined('DB_NAME');
export const DB_HOST = throwIfUndefined('DB_HOST');
export const DB_USERNAME = throwIfUndefined('DB_USERNAME');
export const DB_PORT = throwIfUndefined('DB_PORT');
export const DB_PASSWORD = throwIfUndefined('DB_PASSWORD');
export const BASE_URL = throwIfUndefined('BASE_URL');
