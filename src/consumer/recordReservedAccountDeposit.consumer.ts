import { QueryRunner, createConnection } from 'typeorm';
import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import logger from '../utils/logger';
import { consumerDbTransaction } from '../database/helpers/db';
import ReservedAccountService from '../services/reservedAccount.service';
import { publishMessage } from '../utils/amqpProducer';

interface IRecordReservedTransaction {
  originator_account_number: string;
  originator_account_name: string;
  response: any;
  bank_name: string;
  session_id: string;
  bank_code: string;
  purpose: string;
  wallet: any;
  amount: string;
  narration: string;
  metadata: any;
  reference: string;
  bank_routing_number: string;
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

  async recordReservedTransaction(queryRunner: QueryRunner, content: IRecordReservedTransaction) {
    const {
      originator_account_number,
      originator_account_name,
      response,
      bank_name,
      session_id: sessionId,
      bank_code,
      purpose,
      wallet,
      amount,
      narration,
      metadata,
      reference,
      bank_routing_number,
    } = content;
    await ReservedAccountService.recordReservedAccountTransaction(queryRunner, {
      originator_account_number,
      originator_account_name,
      response,
      bank_name,
      session_id: sessionId,
      bank_code,
      purpose,
      wallet,
      amount,
      narration,
      metadata,
      reference,
      bank_routing_number,
    });
    // publishMessage('debit:transaction:charge', { feesNames: ['debit-fees'], purpose, wallet, amount, narration, metadata, reference });
    // publishMessage('email:notification', { purpose, recipientEmail, templateInfo });
    // publishMessage('app:notification', { purpose, recipientEmail, templateInfo });
  },

  thirdPartyConsumer: new Consumer(
    AMQP_CLIENT,
    'record:reserved:account:deposit',
    async (msg) => {
      if (!Service.connectionExists) await Service.initConnection();
      const channel = Service.thirdPartyConsumer.getChannel();
      if (msg) await consumerDbTransaction(Service.recordReservedTransaction, channel, msg, JSON.parse(msg.content.toString()));
    },
    2,
  ),

  async start() {
    await Service.initConnection();
    Service.thirdPartyConsumer.start();
  },
};

Service.start();
