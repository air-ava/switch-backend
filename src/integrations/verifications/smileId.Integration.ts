/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import axios from 'axios';
import dotenv from 'dotenv';
// eslint-disable-next-line import/no-extraneous-dependencies
import smileIdentityCore from 'smile-identity-core';
import crypto from 'crypto';
import { sendObjectResponse, ValidationError } from '../../utils/errors';
import { log, Log } from '../../utils/logs';
import SmileIdValidator from '../../validators/smileId.validator';
import { theResponse } from '../../utils/interface';
import { SMILEID_API_KEY, SMILEID_CALLBACK_URL, SMILEID_ENV, SMILEID_PARTNER_ID } from '../../utils/secrets';

const { WebApi } = smileIdentityCore;

dotenv.config();

const Service: any = {
  async smmileIdSignature() {
    const timestamp = new Date().toISOString();
    const api_key = String(process.env.SMILEID_API_KEY);
    const partner_id = String(process.env.SMILEID_PARTNER_ID);
    const hmac = crypto.createHmac('sha256', api_key);

    hmac.update(timestamp, 'utf8');
    hmac.update(partner_id, 'utf8');
    hmac.update('sid_request', 'utf8');

    const signature = hmac.digest().toString('base64');
    return { signature, timestamp };
  },

  async smmileIdWebApiConnection() {
    const connectionPayload = {
      api_key: SMILEID_API_KEY,
      partner_id: SMILEID_PARTNER_ID,
      default_callback: SMILEID_CALLBACK_URL,
      ...(SMILEID_ENV === 'SANDBOX' && { sid_server: 0 }),
      ...(SMILEID_ENV === 'PRODUCTION' && { sid_server: 1 }),
    };

    const { partner_id, default_callback, api_key, sid_server } = connectionPayload;
    const connection = new WebApi(partner_id, default_callback, api_key, Number(sid_server));
    return connection;
  },

  axiosInstance: axios.create({
    baseURL: process.env.SMILEID_URL,
    // headers: {
    //   Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    // },
  }),

  smileIDEnv: {
    source_sdk: 'rest_api',
    partner_id: process.env.SMILEID_PARTNER_ID,
    country: 'NG',
    callback_url: process.env.SMILEID_CALLBACK_URL,
  },

  smileIDType: {
    BVN: 'BVN',
    NIN: 'NIN',
    NIN2: 'NIN_SLIP',
    DRIVERS: 'DRIVERS_LICENSE',
    PHONE: 'PHONE_NUMBER',
    VOTER: 'VOTER_ID',
    BANK: 'BANK_ACCOUNT',
  },

  smileIDTypeData: {
    BVN: '00000000000',
    NIN: '00000000000',
    NIN2: '00000000000',
    DRIVERS: 'ABC000000000',
    PHONE: '00000000000',
    VOTER: '0000000000000000000',
    TIN: '00000000-0000',
    CAC: '0000000',
  },

  smileBusinessIDType: {
    TIN: 'TIN',
    CAC: 'CAC',
  },

  smileDocumentIDType: {
    PASSPORT: 'PASSPORT',
    DRIVERS_LICENSE: 'DRIVERS_LICENSE',
    NATIONAL_ID: 'NATIONAL_ID',
    VOTER_ID: 'VOTER_ID',
  },

  smileIDBanks: {
    'Access Bank': Number('044'),
    'Access Bank (Diamond Bank)': Number('063'),
    Ecobank: Number('050'),
    'Enterprise Bank': Number('084'),
    'Fidelity Bank': Number('070'),
    'First Bank': Number('011'),
    'First City Monument Bank': Number('214'),
    'Guaranty Trust Bank': Number('058'),
    'Heritage Bank': Number('030'),
    'Jaiz Bank': Number('301'),
    'Keystone Bank': Number('082'),
    'Mainstreet Bank': Number('014'),
    'Polaris Bank': Number('076'),
    'Stanbic IBTC': Number('039'),
    'Skye Bank': Number('076'),
    'Sterling Bank': Number('232'),
    'Union Bank': Number('032'),
    UBA: Number('033'),
    'Unity Bank': Number('215'),
    'Wema Bank': Number('035'),
    'Zenith Bank': Number('057'),
  },

  async basicKyc(payload: any) {
    log(Log.fg.cyan, `smile-Id basicKyc`);
    const { error } = SmileIdValidator.basicKyc.validate(payload);
    if (error) throw new ValidationError(error.message);

    const { first_name, last_name, phone_number, dob, bank_code, id_type, id_number, gender, partner_params } = payload;
    const { table_id, table_type, table_code } = partner_params;
    const { signature, timestamp } = await Service.smmileIdSignature();

    try {
      const body = {
        ...Service.smileIDEnv,
        signature,
        source_sdk_version: '2.0.0',
        timestamp,
        ...(id_type === Service.smileIDType.DRIVERS && { phone_number, dob }),
        ...(id_type === Service.smileIDType.BANK && { bank_code }),
        ...(gender && { gender }),
        ...(process.env.SMILEID_ENV === 'SANDBOX' && {
          id_number: Service.smileIDTypeData[id_type],
        }),
        ...(process.env.SMILEID_ENV === 'PRODUCTION' && { id_number }),
        id_type,
        first_name,
        last_name,
        partner_params: { job_id: table_code, user_id: table_id, table_type },
      };
      const { data } = await Service.axiosInstance.post('/v2/verify_async', body);
      return sendObjectResponse('smileID response', data);
    } catch (err: any) {
      // throw new HttpException(error.response.data.error, HttpStatus.NOT_ACCEPTABLE);
    }
  },

  async businessKyb(payload: any) {
    log(Log.fg.cyan, `smile-Id businessKyb`);
    const { error } = SmileIdValidator.businessKyc.validate(payload);
    if (error) throw new ValidationError(error.message);

    const { id_type, id_number, company, partner_params } = payload;
    const { table_id, table_type, table_code } = partner_params;
    const { signature, timestamp } = await Service.smmileIdSignature();
    try {
      const body = {
        ...Service.smileIDEnv,
        signature,
        source_sdk_version: '1.0.0',
        timestamp,
        smile_client_id: process.env.SMILEID_PARTNER_ID,
        ...(id_type === Service.smileBusinessIDType.CAC && { company }),
        ...(process.env.SMILEID_ENV === 'SANDBOX' && {
          id_number: Service.smileIDTypeData[id_type],
        }),
        ...(process.env.SMILEID_ENV === 'PRODUCTION' && { id_number }),
        id_type,
        partner_params: {
          job_type: 5,
          job_id: table_code,
          user_id: table_id,
          table_type,
        },
      };
      const data = await Service.axiosInstance.post('/v1/async_id_verification', body);
      return sendObjectResponse('smileID response', data);
    } catch (err: any) {
      log(Log.fg.red, err.response.data);
      // throw new HttpException(error.response.data.message, HttpStatus.NOT_ACCEPTABLE);
    }
  },

  async documentVerification(payload: any): Promise<theResponse | any> {
    log(Log.fg.cyan, `smile-Id documentVerification`);
    const idTypeChange: any = {
      ip: 'PASSPORT',
      dl: 'DRIVERS_LICENSE',
      nin: 'NATIONAL_ID',
      vi: 'VOTER_ID',
    };

    payload.id_type = idTypeChange[payload.id_type];

    const { error } = SmileIdValidator.documentVerification.validate(payload);
    if (error) throw new ValidationError(error.message);

    const { id_type, is_image_base64 = false, image, image_selfie, partner_params: partner } = payload;
    const { table_id, table_type, table_code } = partner;

    try {
      const connection = await Service.smmileIdWebApiConnection();

      const createdPayload = {
        options: {
          return_job_status: true,
          return_history: true,
          return_image_links: false,
          signature: true,
        },
        image_details: [
          {
            image_type_id: 0,
            image: image_selfie || '/Users/danieladegoke/Desktop/Bujeti/api/public/images/Copenhagen.jpg',
          },
          {
            image_type_id: is_image_base64 ? 3 : 1,
            image: '/Users/danieladegoke/Desktop/Bujeti/api/public/images/Copenhagen.jpg',
          },
        ],
        id_info: {
          country: 'NG',
          id_type,
        },
        partner_params: {
          job_type: 6,
          job_id: table_code,
          user_id: table_id,
          table_type,
        },
      };

      const { partner_params, image_details, id_info, options } = createdPayload;

      const response = await connection.submit_job(partner_params, image_details, id_info, options);
      return sendObjectResponse('smileID response', response);
    } catch (err: any) {
      log(Log.fg.red, err.message);
      // throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
    }
  },
};

export default Service;
