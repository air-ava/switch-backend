import { createConnection } from 'typeorm';
import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import logger from '../utils/logger';
// import { createNotificationREPO } from '../database/repositories/notifications';
import { consumerDbTransaction } from '../database/helpers/db';

interface IMessage {
  reciever_id: string; // can be 'user', 'índividual', 'ádmin', 'school', organisation'
  display_type: 'BANNER' | 'ALERTS' | 'BADGES' | 'POP_UP' | 'MODAL';
  action_type: 'SYSTEM' | 'REQUEST' | 'INFO' | 'REMINDER';
  urgency_type: 'HIGH' | 'MEDIUM' | 'LOW';
  reference_code?: string;
  title: string;
  body: string;
  for_admin?: boolean;
  school?: any;
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

  async saveNotification(content: IMessage) {
    const { title, body } = content; // can be 'user', 'índividual', 'ádmin', 'school', organisation'
    // await createNotificationREPO({ reciever_code, type, body, ...(title && { title }), ...(request_id && { request_id }) }); // can be 'user', 'índividual', 'ádmin', 'school', organisation'
  },

  appNotificationConsumer: new Consumer(
    AMQP_CLIENT,
    'app:notification',
    async (msg) => {
      if (!Service.connectionExists) await Service.initConnection();
      const channel = Service.appNotificationConsumer.getChannel();
      if (msg) await consumerDbTransaction(Service.saveNotification, channel, msg, JSON.parse(msg.content.toString()));
    },
    2,
  ),

  async start() {
    await Service.initConnection();
    Service.appNotificationConsumer.start();
  },
};

Service.start();
