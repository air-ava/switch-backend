import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import { sendSlackMessage } from '../integrations/extra/slack.integration';
import { consumerFunction } from '../database/helpers/db';

interface ISlackMessage {
  body: any;
  feature: string;
}

const Service = {
  async slackNotification(content: ISlackMessage) {
    const { body, feature } = content;
    await sendSlackMessage({ body, feature });
  },

  slackNotificationConsumer: new Consumer(AMQP_CLIENT, 'slack:notification', async (msg) => {
    const channel = Service.slackNotificationConsumer.getChannel();
    if (msg) await consumerFunction(Service.slackNotification, channel, msg, JSON.parse(msg.content.toString()));
  }),
};

Service.slackNotificationConsumer.start();
