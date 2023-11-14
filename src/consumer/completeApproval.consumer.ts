import dotenv from 'dotenv';
import { Not, createConnection } from 'typeorm';
import { getQueryRunner } from '../database/helpers/db';

import { Consumer } from './Consumer';
import { AMQP_CLIENT, WEMA_ACCOUNT_PREFIX } from '../utils/secrets';
// import { countWalletsWithAccountPrefix, addAccountPrefixToWallet } from '../database/repositories/wallet';
import logger from '../utils/logger';
import { findIndividual } from '../database/repositories/individual.repo';
import { STATUSES } from '../database/models/status.model';
import { Repo as DocumentREPO } from '../database/repositories/documents.repo';
import SmileIDIntegration from '../integrations/verifications/smileId.Integration';

dotenv.config();

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

  accountPrefixCreation: new Consumer(
    AMQP_CLIENT,
    'complete:school:approval',
    async function (msg) {
      if (!Service.connectionExists) {
        await Service.initConnection();
      }

      const channel = Service.accountPrefixCreation.getChannel();
      const queryRunner = await getQueryRunner();

      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          const { onboarding_reference, document_reference, tag, process, tableId: id, documentId } = content;
          if (tag === 'DIRECTOR') {
            const directorDetails = await findIndividual({ id, status: Not(STATUSES.DELETED) }, [], ['phoneNumber'], queryRunner);
            if (!directorDetails) {
              logger.info({ message: `Individual with ID ${id} Not found`, payload: content });
              channel.ack(msg);
              return;
            }
            const {
              firstName: first_name,
              lastName: last_name,
              phoneNumber: { internationalFormat: phone_number },
              // dob,
              gender,
            } = directorDetails;
            const document = await DocumentREPO.findDocument(
              {
                id: documentId,
                status: Not(STATUSES.DELETED),
              },
              [],
              ['Status', 'Asset'],
            );
            const { type: id_type, number: id_number, table_id } = document;
            await SmileIDIntegration.basicKyc({
              first_name,
              last_name,
              phone_number,
              ...(gender && { gender }),
              id_type,
              id_number,
              partner_params: {
                // table_code: verifyDirectorsDocs.code,
                table_id: String(table_id),
                table_type: 'individual',
              },
            });
          }
          //   const numberOfAccountPrefixes = await countWalletsWithAccountPrefix(queryRunner);
          //   if (numberOfAccountPrefixes >= 70) {
          //     logger.emerg('We are running out of business prefixes');
          //   }
          //   const prefix = numberOfAccountPrefixes === 0 ? `${WEMA_ACCOUNT_PREFIX}999` : `${WEMA_ACCOUNT_PREFIX}${999 - numberOfAccountPrefixes}`;
          //   await addAccountPrefixToWallet({ userMobile, prefix, t: queryRunner });
          await queryRunner.commitTransaction();
          channel.ack(msg);
        } catch (error) {
          await queryRunner.rollbackTransaction();
          logger.error(JSON.stringify(error));
          channel.nack(msg, false, true);
        } finally {
          queryRunner.release();
        }
      }
    },
    2,
  ),

  async start() {
    await this.initConnection();
    this.accountPrefixCreation.start();
  },
};

// Central invocation:
Service.start();
