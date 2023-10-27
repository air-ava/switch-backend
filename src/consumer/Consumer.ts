import amqplib from 'amqplib';
import logger from '../utils/logger';
import { URL } from 'url';

export class Consumer {
  private url: string;

  private conn: amqplib.Connection | undefined;

  private channel: amqplib.Channel | undefined;

  private queue: string;

  private onMessage: (msg: amqplib.ConsumeMessage | null) => void;

  private prefetchCount: number;

  private deadLetterExchange?: string;

  private deadLetterRoutingKey?: string;

  constructor(
    url: string,
    queue: string,
    onMessage: (msg: amqplib.ConsumeMessage | null) => void,
    prefetchCount = 50,
    deadLetterOptions?: { deadLetterExchange: string; deadLetterRoutingKey: string },
  ) {
    this.url = url;
    this.queue = queue;
    this.onMessage = onMessage;
    this.prefetchCount = prefetchCount;
    this.deadLetterExchange = deadLetterOptions?.deadLetterExchange;
    this.deadLetterRoutingKey = deadLetterOptions?.deadLetterRoutingKey;
  }

  public getChannel(): amqplib.Channel {
    return this.channel as amqplib.Channel;
  }

  public async start(): Promise<amqplib.Replies.Consume> {
    const { channel, conn } = await this.createConnection();
    this.channel = channel;
    this.conn = conn;

    await channel.assertQueue(this.queue);

    if (this.deadLetterExchange && this.deadLetterRoutingKey) {
      channel.assertExchange(this.deadLetterExchange, 'direct', { durable: false });
      channel.bindQueue(this.queue, this.deadLetterExchange, this.deadLetterRoutingKey);
    }

    logger.info(`Consumer listening on queue ${this.queue}`);
    const consumer = await channel.consume(this.queue, (msg) => {
      this.onMessage(msg);
    });
    return consumer;
  }

  public async close(): Promise<void> {
    if (!this.channel || !this.conn) {
      throw new Error('No connection');
    }
    await this.channel.close();
    await this.conn.close();
  }

  private async createConnection(): Promise<{
    conn: amqplib.Connection;
    channel: amqplib.Channel;
  }> {
    const { hostname } = new URL(this.url);
    const conn = await amqplib.connect(this.url, { servername: hostname });
    logger.info(`AMQP connected successfully on ${hostname}`);
    const channel = await conn.createChannel();
    channel.prefetch(this.prefetchCount);
    return { conn, channel };
  }
}
