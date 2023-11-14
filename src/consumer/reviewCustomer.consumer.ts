import dotenv from 'dotenv';
import { Not, QueryRunner, createConnection } from 'typeorm';
import { Channel, ConsumeMessage } from 'amqplib';
import { getQueryRunner } from '../database/helpers/db';

import { Consumer } from './Consumer';
import { AMQP_CLIENT, WEMA_ACCOUNT_PREFIX } from '../utils/secrets';
// import { countWalletsWithAccountPrefix, addAccountPrefixToWallet } from '../database/repositories/wallet';
import logger from '../utils/logger';
import { findIndividual } from '../database/repositories/individual.repo';
import { STATUSES } from '../database/models/status.model';
import { Repo as DocumentREPO } from '../database/repositories/documents.repo';
import SmileIDIntegration from '../integrations/verifications/smileId.Integration';
import { getOneOrganisationREPO } from '../database/repositories/organisation.repo';
import CustomError from '../utils/customError';

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

  async reviewDirectorSubmission(data: any, channel: Channel, msg: ConsumeMessage, queryRunner: QueryRunner) {
    const { onboarding_reference, document_reference, tag, process, tableId: id, documentId, school_id } = data;

    const directorDetails = await findIndividual({ id, status: Not(STATUSES.DELETED) }, [], ['phoneNumber'], queryRunner);
    if (!directorDetails) {
      logger.info({ message: `Individual with ID ${id} Not found`, payload: data });
      channel.ack(msg);
      return;
    }
    logger.info({ message: `Director Submission`, payload: data });
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
        onboarding_reference,
        document_reference,
        process,
        school_id,
      },
    });
  },

  async reviewBusinessSubmission(data: any, channel: Channel, msg: ConsumeMessage, queryRunner: QueryRunner) {
    const { onboarding_reference, document_reference, tag, process, user_id, documentId, school_id } = data;

    const organisationDetails = await getOneOrganisationREPO({ onboarding_reference, status: STATUSES.ACTIVE }, []);
    if (!organisationDetails) {
      logger.info({ message: `organisation with Onboarding Reference ${onboarding_reference} Not found`, payload: data });
      channel.ack(msg);
      return;
    }
    logger.info({ message: `Business Submission`, payload: { data, organisationDetails } });
    const document = await DocumentREPO.findDocument(
      {
        id: documentId,
        status: Not(STATUSES.DELETED),
      },
      [],
      ['Asset'],
    );
    console.log({ document, data });
    const { type: id_type, number: id_number, entity_id, asset_id } = document;
    const partner_params = {
      onboarding_reference,
      document_reference,
      process,
      school_id,
      table_id: String(entity_id),
      table_type: 'business',
      user_id,
    };
    console.log({ partner_params });
    if (asset_id) {
      const verification = await SmileIDIntegration.documentVerification({
        id_type,
        images: [
          {
            is_image_base64: false,
            image_type: 'ID',
            image_face: 'FRONT',
            image: document.Asset.url,
          },
        ],
        partner_params,
      });
      console.log({ verification });
      if (!verification.success) throw new CustomError(verification.error, 400, verification.data);
    }
    if (id_number) {
      const verification = await SmileIDIntegration.businessKyb({
        id_type: id_type === 'TIN' ? 'TIN' : 'CAC',
        id_number,
        business_type: tag,
        company: organisationDetails.name,
        partner_params,
      });
      console.log({ verification });
      if (!verification.success) throw new CustomError(verification.error, 400, verification.data);
    }
  },

  reviewSubmission: new Consumer(
    AMQP_CLIENT,
    'review:customer:submission',
    async function (msg) {
      if (!Service.connectionExists) await Service.initConnection();

      const channel = Service.reviewSubmission.getChannel();
      const queryRunner = await getQueryRunner();

      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          const { documentId, tag } = content;
          if (tag === 'DIRECTOR') await Service.reviewDirectorSubmission(content, channel, msg, queryRunner);
          if (tag === 'LIMITED_LIABILITY' || tag === 'SOLE_PROPITOR') await Service.reviewBusinessSubmission(content, channel, msg, queryRunner);
          else {
            logger.info({ message: `document with ID ${documentId} Not belonging to any domain for verification`, payload: content });
            channel.ack(msg);
          }
          console.log({ content: 'here' });
          await queryRunner.commitTransaction();
          channel.ack(msg);
        } catch (error) {
          console.log({ error });
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
    this.reviewSubmission.start();
  },
};

// Central invocation:
Service.start();
