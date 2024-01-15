import amqplib, { Channel, Connection } from 'amqplib';
import { URL } from 'url';
import { AMQP_CLIENT } from './secrets';
import logger from './logger';

let conn: Connection | undefined;

let channel: Channel;

/**
 * An Util Function that establich connection to rabbitMQ
 * @paramconfiguration properties these are the rabbitMQ configuration info
 * @returns boolean i.e either true or faalse
 * `connectAMQP` open connection to the rabbitMQ platform
 * @engineer Taiwo Fayipe
 */
const connectAMQP = async () => {
  try {
    const { hostname } = new URL(AMQP_CLIENT);
    const connection = await amqplib.connect(AMQP_CLIENT, { servername: hostname });
    conn = connection;
    channel = await conn.createChannel();
  } catch (error) {
    console.log({ error });
  }
};

/**
 * An Util Function that broadcast message to rabbitMQ
 * @param {object message} this is an object of the message properties
 * @returns boolean i.e either true or faalse
 * `publishMessage` broadcast message to rabbitmq to process the transaction
 * @engineer Taiwo Fayipe
 */
export const publishMessage = async (
  queue: string,
  message: { [key: string]: any },
  queueOptions?: amqplib.Options.AssertQueue,
  messageOptions?: amqplib.Options.Publish,
): Promise<void> => {
  if (!conn) await connectAMQP();

  await channel.assertQueue(queue, { ...queueOptions, durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { ...messageOptions, persistent: true });
  logger.info(` [x] Sent message to ${queue}`);
};
