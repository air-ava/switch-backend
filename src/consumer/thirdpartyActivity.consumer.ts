import { createConnection } from 'typeorm';
import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import logger from '../utils/logger';
import { consumerDbTransaction } from '../database/helpers/db';
import { saveThirdPartyLogsREPO } from '../database/repositories/thirdParty.repo';

interface IThirdPartyEvent {
  event: string;
  message: string;
  endpoint: string;
  school: number;
  endpoint_verb: string;
  status_code: string;
  provider_type: string;
  provider: string;
  payload: string;
  reference?: string;
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

  async thirdPartyLogger(content: IThirdPartyEvent) {
    const { event, message, endpoint, school, endpoint_verb, status_code, payload, provider_type, provider, reference } = content;
    await saveThirdPartyLogsREPO({
      event,
      message,
      endpoint,
      school,
      endpoint_verb,
      status_code,
      payload,
      provider_type,
      provider,
      ...(reference && { reference }),
    });
  },

  thirdPartyConsumer: new Consumer(
    AMQP_CLIENT,
    'thirdparty:activity:logger',
    async (msg) => {
      if (!Service.connectionExists) await Service.initConnection();
      const channel = Service.thirdPartyConsumer.getChannel();
      if (msg) await consumerDbTransaction(Service.thirdPartyLogger, channel, msg, JSON.parse(msg.content.toString()));
    },
    2,
  ),

  async start() {
    await Service.initConnection();
    Service.thirdPartyConsumer.start();
  },
};

Service.start();
