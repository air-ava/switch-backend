/* eslint-disable import/no-extraneous-dependencies */
import { createClient } from 'redis';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

// eslint-disable-next-line import/first
import { REDIS_URL } from './secrets';

const client = createClient({ url: REDIS_URL });
export const redisClient = client;

client.on('connect', () => {
  logger.info('Redis client connected');
});

client.on('error', (err: any) => {
  logger.info(`Something went wrong ${err}`);
});

export const get = (key: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    client.get(key, (err: any, reply: any) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

export const setex = (key: string, value: string, expiry: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    client.setex(key, expiry, value, (err: any, reply: any) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};
export const setter = (key: string, value: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    client.set(key, value, (err: any, result: any) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

export const getter = (key: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    client.get(key, (err: any, reply: any) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};
