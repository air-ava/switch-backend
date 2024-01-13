import { QueryRunner, createConnection } from 'typeorm';
import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import logger from '../utils/logger';
import { consumerDbTransaction } from '../database/helpers/db';
import ReservedAccountService from '../services/reservedAccount.service';

interface IAssignAccountNumber {
  holder: 'student' | 'school';
  holderId: string;
  school: any;
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

  async assignAccountNumber(queryRunner: QueryRunner, content: IAssignAccountNumber) {
    const { holderId, holder, school } = content;
    await ReservedAccountService.assignAccountNumber({ holder, holderId, school });
  },

  assignAccountNumberConsumer: new Consumer(
    AMQP_CLIENT,
    'assign:account:number',
    async (msg) => {
      if (!Service.connectionExists) await Service.initConnection();
      const channel = Service.assignAccountNumberConsumer.getChannel();
      if (msg) await consumerDbTransaction(Service.assignAccountNumber, channel, msg, JSON.parse(msg.content.toString()));
    },
    2,
  ),

  async start() {
    await Service.initConnection();
    Service.assignAccountNumberConsumer.start();
  },
};

Service.start();
