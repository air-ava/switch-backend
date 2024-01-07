import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import { sendEmail } from '../utils/mailtrap';
import { consumerFunction } from '../database/helpers/db';

interface IEmailMessage {
  purpose: string;
  recipientEmail: string;
  templateInfo: { [key: string]: string };
}

const Service = {
  async emailNotification(content: IEmailMessage) {
    const { recipientEmail, purpose, templateInfo } = content;
    await sendEmail({ recipientEmail, purpose, templateInfo });
  },

  emailNotificationConsumer: new Consumer(AMQP_CLIENT, 'email:notification', async (msg) => {
    const channel = Service.emailNotificationConsumer.getChannel();
    if (msg) await consumerFunction(Service.emailNotification, channel, msg, JSON.parse(msg.content.toString()));
  }),
};

Service.emailNotificationConsumer.start();
