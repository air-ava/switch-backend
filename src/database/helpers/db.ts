/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Channel, ConsumeMessage } from 'amqplib';
import { getConnection, QueryRunner } from 'typeorm';
import logger from '../../utils/logger';

export const getQueryRunner = async (): Promise<QueryRunner> => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  return queryRunner;
};

export const dbTransaction = async (callback: any, data?: any): Promise<any> => {
  const queryRunner = await getQueryRunner();
  try {
    const result = await callback(queryRunner, data);
    await queryRunner.commitTransaction();
    return result;
  } catch (e) {
    await queryRunner.rollbackTransaction();
    throw e;
  } finally {
    await queryRunner.release();
  }
};

// eslint-disable-next-line consistent-return
export const consumerDbTransaction = async (callback: any, channel: Channel, msg: ConsumeMessage, data?: any): Promise<any> => {
  const queryRunner = await getQueryRunner();
  try {
    const result = await callback(queryRunner, data);
    await queryRunner.commitTransaction();
    channel.ack(msg);
    return result;
  } catch (error) {
    console.log({ error });
    await queryRunner.rollbackTransaction();
    logger.error(JSON.stringify(error));
    channel.nack(msg, false, true);
  } finally {
    await queryRunner.release();
  }
};

export const consumerFunction = async (callback: any, channel: Channel, msg: ConsumeMessage, data?: any): Promise<any> => {
  try {
    const result = await callback(data);
    channel.ack(msg);
    return result;
  } catch (error) {
    console.log({ error })
    logger.error(JSON.stringify(error));
    channel.nack(msg, false, true);
  }
};
