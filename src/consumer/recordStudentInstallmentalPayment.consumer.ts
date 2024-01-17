import { QueryRunner, createConnection } from 'typeorm';
import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import logger from '../utils/logger';
import { consumerDbTransaction } from '../database/helpers/db';
import FeesService from '../services/fees.service';
import { publishMessage } from '../utils/amqpProducer';

interface IRecordInstallmentalPay {
  paymentContact: any;
  amount: string;
  metadata: any;
  reference: string;
  student: any;
  beneficiaryId?: number | string;
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

  async recordInstallmentalPay(queryRunner: QueryRunner, content: IRecordInstallmentalPay) {
    const { paymentContact, amount, metadata, reference, student, beneficiaryId } = content;
    await FeesService.recordInstallment({
      amount,
      reference,
      paymentContact,
      metadata,
      beneficiaryId: beneficiaryId || student.id,
    });
  },

  recordInstallmentalPaymentConsumer: new Consumer(
    AMQP_CLIENT,
    'record:student:installmental:payment',
    async (msg) => {
      if (!Service.connectionExists) await Service.initConnection();
      const channel = Service.recordInstallmentalPaymentConsumer.getChannel();
      if (msg) await consumerDbTransaction(Service.recordInstallmentalPay, channel, msg, JSON.parse(msg.content.toString()));
    },
    2,
  ),

  async start() {
    await Service.initConnection();
    Service.recordInstallmentalPaymentConsumer.start();
  },
};

Service.start();
