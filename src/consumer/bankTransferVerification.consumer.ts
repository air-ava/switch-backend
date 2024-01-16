import { QueryRunner, createConnection } from 'typeorm';
import dateformat from 'dateformat';
import { AMQP_CLIENT } from '../utils/secrets';
import { Consumer } from './Consumer';
import logger from '../utils/logger';
import { consumerDbTransaction } from '../database/helpers/db';
import ReservedAccountService from '../services/reservedAccount.service';
import { requeryTransaction } from '../integration/wema/banks';
import { STATUSES } from '../database/models/status.model';
import { publishMessage } from '../utils/amqpProducer';
import BankTransferRepo from '../database/repositories/bankTransfer.repo';
import { updateTransactionREPO } from '../database/repositories/transaction.repo';

interface IBankTransferVerification {
  reference: string;
  narration: string;
  wallet: any;
  school: any;
  transaction: any;
  foundBank: any;
  user: any;
  amount: string | number;
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

  async bankTransferVerification(content: IBankTransferVerification) {
    const { transaction, reference, wallet, school, foundBank, user, amount, narration } = content;
    const transactionResponse = await requeryTransaction(reference);
    // todo: update transaction as successful
    await BankTransferRepo.updateBankTransfer(
      { tx_reference: reference },
      { updated_at: new Date(), response: 'Transfer successful', status: STATUSES.SUCCESS },
    );
    await updateTransactionREPO({ id: transaction.id }, { updated_at: new Date(), status: STATUSES.SUCCESS });
    await publishMessage('slack:notification', {
      body: {
        amount: `${wallet.currency}${Number(amount) / 100}`,
        reference,
        bankName: foundBank.bank_name,
        schoolName: school.name,
        initiator: `${user.first_name} ${user.last_name}`,
        createdAt: `${dateformat(new Date(), 'fullDate')}`,
        accountName: foundBank.account_name,
        narration,
        accountNumber: foundBank.number,
      },
      feature: 'bank_transfer',
    });
  },

  bankTransferVerificationConsumer: new Consumer(
    AMQP_CLIENT,
    'bank:transfer:verification',
    async (msg) => {
      if (!Service.connectionExists) await Service.initConnection();
      const channel = Service.bankTransferVerificationConsumer.getChannel();
      if (msg) await consumerDbTransaction(Service.bankTransferVerification, channel, msg, JSON.parse(msg.content.toString()));
    },
    2,
  ),

  async start() {
    await Service.initConnection();
    Service.bankTransferVerificationConsumer.start();
  },
};

Service.start();
