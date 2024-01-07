import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import { consumerFunction } from '../database/helpers/db';
import { sendSms } from '../integration/africasTalking/sms.integration';

interface ISmsMessage {
  phoneNumber: string;
  message: string;
}

const Service = {
  async smsNotification(content: ISmsMessage) {
    const { phoneNumber, message } = content;
    await sendSms({ phoneNumber, message });
  },

  smsNotificationConsumer: new Consumer(AMQP_CLIENT, 'sms:notification', async (msg) => {
    const channel = Service.smsNotificationConsumer.getChannel();
    if (msg) await consumerFunction(Service.smsNotification, channel, msg, JSON.parse(msg.content.toString()));
  }),
};

Service.smsNotificationConsumer.start();
