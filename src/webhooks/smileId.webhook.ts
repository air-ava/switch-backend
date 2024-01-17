/* eslint-disable default-case */
import { type } from 'os';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { In, Not } from 'typeorm';
import { updateIndividual } from '../database/repositories/individual.repo';
import DocumentRepo from '../database/repositories/documents.repo';
import { Repo as DocumentRequirementREPO } from '../database/repositories/documentRequirement.repo';
import { getOneOrganisationREPO } from '../database/repositories/organisation.repo';
import { updateUser } from '../database/repositories/user.repo';
import { STATUSES } from '../database/models/status.model';
import { IDocuments } from '../database/modelInterfaces';
import { saveThirdPartyLogsREPO } from '../database/repositories/thirdParty.repo';
import { sendObjectResponse } from '../utils/errors';
import { SMILEID_CALLBACK_URL } from '../utils/secrets';
import { publishMessage } from '../utils/amqpProducer';
import DocumentService from '../services/document.service';
import {
  SMILE_ERROR_MESSAGES,
  SMILE_ErrorCodes,
  IStatusAndResponse,
  SMILE_STATUS_CATEGORIES,
  SMILE_SUCCESS_MESSAGES,
  SMILE_SuccessCodes,
  isValidEnumValue,
} from '../dto/smileId.dto';

dotenv.config();

const Service: any = {
  getStatusByCategory(category: string): number {
    switch (category) {
      case SMILE_STATUS_CATEGORIES.REJECTED:
        return STATUSES.REJECTED;
      case SMILE_STATUS_CATEGORIES.APPROVED:
        return STATUSES.VERIFIED;
      case SMILE_STATUS_CATEGORIES.AUTHORISATION_ERRORS:
      case SMILE_STATUS_CATEGORIES.AVAILABILITY_ERROR:
      case SMILE_STATUS_CATEGORIES.PARAMETER_ERROR:
        return STATUSES.PENDING;
      default:
        return STATUSES.UNVERIFIED; // Default case if the category does not match
    }
  },

  determineStatusAndResponse(ResultCode: string): any {
    let status = STATUSES.UNVERIFIED;
    let response = '';

    if (isValidEnumValue(ResultCode as string, SMILE_ErrorCodes)) {
      const errorMessage = SMILE_ERROR_MESSAGES[ResultCode as SMILE_ErrorCodes];
      const [approvalStatus, matchType] = errorMessage.split(':');

      // Use STATUS_CATEGORIES for mapping the status
      status = Service.getStatusByCategory(approvalStatus);
      response = approvalStatus;
    } else if (isValidEnumValue(ResultCode, SMILE_SuccessCodes)) {
      const successMessage = SMILE_SUCCESS_MESSAGES[ResultCode as SMILE_SuccessCodes];
      const [approvalStatus, matchType] = successMessage.split(':');
      status = Service.getStatusByCategory(approvalStatus);
      response = `${approvalStatus}:${matchType}`;
    } else {
      console.error(`Invalid ResultCode: ${ResultCode}`);
    }

    return { status, response };
  },

  async processDocumentBasedOnType(
    onboarding_reference: string,
    table_type: string,
    table_id: string,
    process: 'onboarding' = 'onboarding',
    tag: string,
    document: Partial<IDocuments>,
    statusAndResponse: IStatusAndResponse,
    metadata?: any,
  ): Promise<void> {
    switch (table_type) {
      case 'individual':
        await updateIndividual({ id: Number(table_id) }, { status: statusAndResponse.status });
        break;
      case 'organisations': {
        // This would involve more complex logic, for example:
        const approved = await DocumentService.areAllRequiredDocumentsApproved({ tag, process, country: document.country });
        if (approved)
          await publishMessage('complete:school:approval', {
            onboarding_reference,
            document_reference: document.reference,
            tag,
            process,
            tableId: table_id,
            metadata,
          });
        break;
      }
      case 'users':
        // await updateUser({ id: String(table_id) }, { status: statusAndResponse.status });
        await publishMessage('complete:user:approval', {
          onboarding_reference,
          document_reference: document.reference,
          tag,
          process,
          tableId: table_id,
          metadata,
        });
        break;
    }
  },

  async basicKycResponseNew(payload: any): Promise<void> {
    try {
      const { Source, PartnerParams } = payload;
      const { document_id, process, tag, document_reference, onboarding_reference, table_id, table_type, user_id, school_id } = PartnerParams;

      const ResultCode = payload.ResultCode.toString();

      const statusAndResponse = Service.determineStatusAndResponse(ResultCode);

      await Service.updateDocument(document_id, table_type, user_id, payload, statusAndResponse);

      const document = await DocumentRepo.findDocument({ id: document_id }, ['entity_id', 'reference']);

      const metadata = { document_reference };
      await Service.processDocumentBasedOnType(onboarding_reference, table_type, table_id, process, tag, document, statusAndResponse, metadata);

      saveThirdPartyLogsREPO({
        message: Source,
        school: school_id, // org id
        event: `smileId.webhook.response`,
        payload: JSON.stringify(payload),
        provider: 'SMILEID',
        provider_type: 'verifier',
        status_code: '200',
        endpoint_verb: 'POST',
        endpoint: SMILEID_CALLBACK_URL,
      });

      sendObjectResponse('smileID response');
    } catch (error) {
      console.error('An error occurred while processing the KYC response:', error);
      throw new Error('Error processing KYC response');
    }
  },

  async updateDocument(job_id: string, table_type: string, user_id: string, payload: any, statusAndResponse: IStatusAndResponse): Promise<void> {
    const { SmileJobID, ResultType, ResultText, ResultCode, IsFinalResult, Actions, Source, timestamp, FullData } = payload;
    const { Return_Personal_Info, Verify_ID_Number, Names, DOB, Gender, Phone_Number, ID_Verification } = Actions;
    await DocumentRepo.updateDocuments(
      { id: job_id },
      {
        metadata: {
          // ...populate with metadata from payload
          ResultText,
          ResultCode,
          timestamp,
          SmileJobID,
          ResultType,
          IsFinalResult,
          Source,
          Return_Personal_Info,
          ...(Verify_ID_Number && { Verify_ID_Number }),
          ...(Names && { Names }),
          ...(DOB && { DOB }),
          ...(Gender && { Gender }),
          ...(Phone_Number && { Phone_Number }),
          ...(ID_Verification && { ID_Verification }),
          ...(payload.ResultCode === Service.error && { status: STATUSES.UNVERIFIED }),
          ...(FullData &&
            FullData.RegistrationDate && {
              issuing_date: new Date(FullData.RegistrationDate).toISOString(),
            }),
        },
        processor: 'SMILE-ID',
        status: statusAndResponse.status,
        response: statusAndResponse.response,
      },
    );
  },
};

export default Service;
