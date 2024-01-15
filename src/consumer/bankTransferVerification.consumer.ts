import { QueryRunner, createConnection } from 'typeorm';
import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import logger from '../utils/logger';
import { consumerDbTransaction } from '../database/helpers/db';
import ReservedAccountService from '../services/reservedAccount.service';
import { requeryTransaction } from '../integration/wema/banks';

interface IBankTransferVerification {
  reference: string;
}

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

  async bankTransferVerification(content: IBankTransferVerification) {
    const { reference } = content;
    const transactionResponse = await requeryTransaction(reference);
    // todo: update transaction as successful
  },

  bankTransferVerificationConsumer: new Consumer(
    AMQP_CLIENT,
    'bank:transfer:verification',
    async (msg) => {
      if (!Service.connectionExists) await Service.initConnection();
      const channel = Service.bankTransferVerificationConsumer.getChannel();
      if (msg) await consumerDbTransaction(Service.bankTransferVerification, channel, msg, JSON.parse(msg.content.toString()));
    },
    2,
  ),

  async start() {
    await Service.initConnection();
    Service.bankTransferVerificationConsumer.start();
  },
};

Service.start();
