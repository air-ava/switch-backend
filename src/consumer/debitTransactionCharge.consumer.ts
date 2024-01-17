import { QueryRunner, createConnection } from 'typeorm';
import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import logger from '../utils/logger';
import { consumerDbTransaction } from '../database/helpers/db';
import ReservedAccountService from '../services/reservedAccount.service';

interface IDebitTransactionCharge {
  purpose: string;
  wallet: any;
  amount: string;
  narration: string;
  metadata: any;
  reference: string;
  feesNames: string[];
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

  async debitTransactionCharge(queryRunner: QueryRunner, content: IDebitTransactionCharge) {
    const { feesNames, purpose, wallet, amount, narration, metadata, reference } = content;
    await ReservedAccountService.completeTransactionCharge(queryRunner, { purpose, wallet, amount, narration, metadata, reference, feesNames });
  },

  thirdPartyConsumer: new Consumer(
    AMQP_CLIENT,
    'debit:transaction:charge',
    async (msg) => {
      if (!Service.connectionExists) await Service.initConnection();
      const channel = Service.thirdPartyConsumer.getChannel();
      if (msg) await consumerDbTransaction(Service.debitTransactionCharge, channel, msg, JSON.parse(msg.content.toString()));
    },
    2,
  ),

  async start() {
    await Service.initConnection();
    Service.thirdPartyConsumer.start();
  },
};

Service.start();
