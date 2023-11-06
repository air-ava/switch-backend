const { IndividualRepo, DocumentRepo, CompanyRepo, UserRepo } = require('../repositories/index.repo');
const { STATUSES } = require('../models/status');
const responseUtils = require('../utils/response.utils');
const { ValidationError, HttpException, HttpStatus } = require('../utils/error.utils');
const { log, Log } = require('../utils/logger.utils');
const API = require('../services/api');
const { Company } = require('../services/index');
const ThirdPartyLogService = require('../services/thirdPartyLog');

require('dotenv').config();
let crypto = require('crypto');
const { type } = require('os');

const Service: any = {
  error: '0001' || '2405' || '2213' || '2204' || '2205' || '2220' || '2212' || '1013' || '1014' || '1015' || '1016' || '1022' || '0811' || '0812',
  error_message: {
    '0001': 'Rejected: Data Invalid',
    2405: 'Authorisation_Errors: An invalid signature was used to sign the request',
    2213: 'Parameter_Error: Not all the required keys were submitted in the info.json or request payload',
    2204: 'Parameter_Error: The format of one of the request values was wrong.',
    2205: 'Authorisation_Errors: An invalid signature was used to sign the request',
    2220: 'Authorisation_Errors: You have not completed your KYC',
    2212: 'Parameter_Error: An invalid value was inputted in the job_type key',
    1013: 'Rejected:Invalid_ID: The ID info was not found in the ID authority database.',
    1014: 'Parameter_Error: The ID number submitted was of an invalid format',
    1015: 'Avalability_Error: The ID authority is unavailable',
    1016: 'Authorisation_Errors:Need_to_Activate_Product: You do not have access to the ID Type',
    1022: 'Rejected:No_Match: None of the user submitted details partially/exactly match the ID info in the ID authority database',
    '0811':
      'Rejected:Unable_to_Verify_Document: Document is expired || The selfie did not match the photo on document || Selfie failed liveness checks || Some security features were missing on the document || The information on document is inconsistent || A wrong document type was uploaded',
    '0812':
      'Rejected:Unable_to_Verify_Document: Document verification failed because the document image is unusable or an invalid document image was uploaded',
  },
  success: '1020' || '1021' || '0810' || '1022' || '1012',
  success_message: {
    '0001': 'Approved:Exact_Match: The user submitted details exactly match the ID info in the ID authority database',
    2405: 'Approved:Partial_Match: At least one of the user submitted details partially/exactly match the ID info in the ID authority database',
    '0810': 'Approved:Document_Verified:Images matched, no spoof was detected on Selfie and the document is valid',
    1022: 'Approved:No Match',
    1012: 'Approved:Validated: ID_Number_Validated',
  },

  async basicKycResponse(payload: any) {
    const { SmileJobID, ResultType, ResultText, ResultCode, IsFinalResult, Actions, Source, timestamp, PartnerParams, FullData } = payload;
    const { user_id, job_id, job_type, table_type } = PartnerParams;
    const { Return_Personal_Info, Verify_ID_Number, Names, DOB, Gender, Phone_Number, ID_Verification } = Actions;
    // let userData;
    // if (FullData) userData = FullData
    // const { RegistrationDate } = userData;

    const statusAndResponse = {
      status: {
        ...(Service.error_message[ResultCode] && {
          ...(Service.error_message[ResultCode].split(':')[0] === 'Rejected' && { status: STATUSES.REJECTED }),
          ...(Service.error_message[ResultCode].split(':')[0] === 'Authorisation_Errors' && { status: STATUSES.PENDING }),
          ...(Service.error_message[ResultCode].split(':')[0] === 'Avalability_Error' && { status: STATUSES.PENDING }),
          ...(Service.error_message[ResultCode].split(':')[0] === 'Parameter_Error' && { status: STATUSES.PENDING }),
        }),
        ...(Service.success_message[ResultCode] && {
          status: STATUSES.VERIFIED,
        }),
      },
      response: {
        ...(Service.error_message[ResultCode] && {
          response: Service.error_message[ResultCode].split(':')[0],
        }),
        ...(Service.success_message[ResultCode] && {
          response: `${Service.success_message[ResultCode].split(':')[0]}:${Service.success_message[ResultCode].split(':')[1]}`,
        }),
      },
    };

    // Actual Logic
    await DocumentRepo.updateADocument({
      queryParams: { code: job_id, table_type, id: user_id },
      updateFields: {
        metadata: {
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
          ...(ResultCode === Service.error && { status: STATUSES.UNVERIFIED }),
          ...(FullData &&
            FullData.RegistrationDate && {
              issuing_date: Date.parse(FullData.RegistrationDate),
            }),
        },
        status: statusAndResponse.status.status,
        response: statusAndResponse.response.response,
      },
      selectOptions: ['table_id'],
    });

    const document = await DocumentRepo.getOneDocument({
      queryParams: { code: job_id, table_type, id: user_id },
      selectOptions: ['table_id', 'reference'],
    });

    const foundCompany = await CompanyRepo.getOneCompany({
      queryParams: {
        document_reference: document.reference,
        id: document.table_id,
      },
      selectOptions: ['document_reference', 'status'],
    });

    if (table_type === 'individual')
      await IndividualRepo.updateAIndividual({
        queryParams: { id: document.table_id },
        updateFields: {
          status: statusAndResponse.status.status,
        },
      });
    if (table_type === 'business') {
      const allDocs = await DocumentRepo.getAllDocuments({
        queryParams: { reference: document.reference },
        selectOptions: ['table_id', 'reference', 'status', 'type'],
      });

      const theDocs = allDocs.map((e: any) => e.status);
      const isAllDocsVerified = theDocs.includes(7);

      if (!isAllDocsVerified) {
        const wait = await Company.reviewCompany({
          decision: 'ACCEPTED',
          company: foundCompany.code,
        });
      }
    }

    if (table_type === 'user')
      await UserRepo.updateUser({
        queryParams: { id: document.table_id },
        updateFields: {
          status: statusAndResponse.status.status,
        },
      });

    ThirdPartyLogService.createLog({
      message: Source,
      company: foundCompany.id,
      event: `smileId_webhook_response`,
      payload: JSON.stringify(payload),
      provider: 1,
      providerType: 'verifier',
      response: (payload && JSON.stringify(payload)) || '',
      statusCode: 200,
      method: 'POST',
      url: process.env.SMILEID_CALLBACK_URL,
    });
    // `${table_type}.update`
    return responseUtils.sendObjectResponse('smileID response');
  },
};

export default Service;
