import { createConnection } from 'typeorm';
import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import logger from '../utils/logger';
// import { createNotificationREPO } from '../database/repositories/notifications';
import { consumerDbTransaction } from '../database/helpers/db';

interface IMessage {
  user_mobile: string;
  type: string;
  title: string;
  body: string;
  request_id: number;
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
    const { user_mobile, type, title, body, request_id } = content;
    // await createNotificationREPO({ user_mobile, type, body, ...(title && { title }), ...(request_id && { request_id }) });
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
