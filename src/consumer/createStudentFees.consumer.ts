import { QueryRunner, createConnection } from 'typeorm';
import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import logger from '../utils/logger';
import { consumerDbTransaction } from '../database/helpers/db';
import StudentService from '../services/student.service';
import { publishMessage } from '../utils/amqpProducer';
import Utils from '../utils/utils';
import ValidationError from '../utils/validationError';
import { listBeneficiaryProductPayments } from '../database/repositories/beneficiaryProductPayment.repo';
import { Sanitizer } from '../utils/sanitizer';

interface ICreateStudentFee {
  student: any;
  classFee: any;
}

const Service: any = {
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

  async createStudentFee(queryRunner: QueryRunner, content: ICreateStudentFee) {
    const { student, classFee } = content;

    await StudentService.addFeeForStudent({
      student,
      classFee,
      t: queryRunner,
    });
  },

  createStudentFeeConsumer: new Consumer(
    AMQP_CLIENT,
    'create:student:fees',
    async (msg) => {
      if (!Service.connectionExists) await Service.initConnection();
      const channel = Service.createStudentFeeConsumer.getChannel();
      if (msg) await consumerDbTransaction(Service.createStudentFee, channel, msg, JSON.parse(msg.content.toString()));
    },
    2,
  ),

  async start() {
    await Service.initConnection();
    Service.createStudentFeeConsumer.start();
  },
};

Service.start();
