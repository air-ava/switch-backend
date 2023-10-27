import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import { getQueryRunner } from '../database/helpers/db';

import { Consumer } from './Consumer';
import { AMQP_CLIENT, WEMA_ACCOUNT_PREFIX } from '../utils/secrets';
// import { countWalletsWithAccountPrefix, addAccountPrefixToWallet } from '../database/repositories/wallet';
import logger from '../utils/logger';

dotenv.config();

const Service = {
  connectionExists: false,

  async initConnection() {
    try {
      await createConnection();
      this.connectionExists = true;
      logger.info('Database connected');
    } catch (err) {
      logger.error(`Could not connect to database ${JSON.stringify(err)}`);
      process.exit(1);
    }
  },

  accountPrefixCreation: new Consumer(
    AMQP_CLIENT,
    'account:prefix:creation',
    async function (msg) {
      if (!Service.connectionExists) {
        await Service.initConnection();
      }

      const channel = Service.accountPrefixCreation.getChannel();
      const queryRunner = await getQueryRunner();

      if (msg) {
        try {
          const { userMobile } = JSON.parse(msg.content.toString());

        //   const numberOfAccountPrefixes = await countWalletsWithAccountPrefix(queryRunner);
        //   if (numberOfAccountPrefixes >= 70) {
        //     logger.emerg('We are running out of business prefixes');
        //   }
        //   const prefix = numberOfAccountPrefixes === 0 ? `${WEMA_ACCOUNT_PREFIX}999` : `${WEMA_ACCOUNT_PREFIX}${999 - numberOfAccountPrefixes}`;
        //   await addAccountPrefixToWallet({ userMobile, prefix, t: queryRunner });
          await queryRunner.commitTransaction();
          channel.ack(msg);
        } catch (error) {
          await queryRunner.rollbackTransaction();
          logger.error(JSON.stringify(error));
          channel.nack(msg, false, true);
        } finally {
          queryRunner.release();
        }
      }
    },
    2,
  ),

  async start() {
    await this.initConnection();
    this.accountPrefixCreation.start();
  },
};

// Central invocation:
Service.start();
