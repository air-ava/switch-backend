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

export const USER_GATEWAY_PORT = throwIfUndefined('USER_GATEWAY_PORT');
export const JWT_KEY = throwIfUndefined('JWT_KEY');
