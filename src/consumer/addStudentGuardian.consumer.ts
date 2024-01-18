import { QueryRunner, createConnection } from 'typeorm';
import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import logger from '../utils/logger';
import { consumerDbTransaction } from '../database/helpers/db';
import StudentService from '../services/student.service';

interface IAddStudentGuardian {
  student: any;
  incomingGuardians: any;
  guardian: any;
  school: any;
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

  async addStudentGuardian(queryRunner: QueryRunner, content: IAddStudentGuardian) {
    const { student, incomingGuardians, guardian, school } = content;

    await StudentService.addGuardian({
      student,
      school,
      incomingGuardians,
      guardian,
      t: queryRunner,
    });
  },

  addStudentGuardianConsumer: new Consumer(
    AMQP_CLIENT,
    'add:student:guardian',
    async (msg) => {
      if (!Service.connectionExists) await Service.initConnection();
      const channel = Service.addStudentGuardianConsumer.getChannel();
      if (msg) await consumerDbTransaction(Service.addStudentGuardian, channel, msg, JSON.parse(msg.content.toString()));
    },
    2,
  ),

  async start() {
    await Service.initConnection();
    Service.addStudentGuardianConsumer.start();
  },
};

Service.start();
