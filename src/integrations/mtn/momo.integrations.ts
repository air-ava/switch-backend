import axios from 'axios';
import https from 'https';
import { ValidationError, NotFoundError, FailedDependencyError } from '../../utils/errors';
import Utils from '../../utils/utils';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const generateAuthorization = Buffer.from(`${Utils.getMoMoAuth().userReferenceId}:${Utils.getMoMoAuth().apiKey}`).toString('base64');

const Service: any = {
  axiosInstance: axios.create({
    baseURL: `${Utils.getMoMoURL()}`,
    headers: {
      // Authorization: `Basic ${generateAuthorization}`,
      'Ocp-Apim-Subscription-Key': `${(Utils.getMoMoProductKeys() as any).collection}`,
    },
  }),

  async createToken(productKey: string) {
    try {
      const response = await Service.axiosInstance.post('/collection/token/', {}, { headers: { Authorization: `Basic ${generateAuthorization}` } });
      return response.data;
    } catch (error: any) {
      console.log({ error: error.config.headers, response: error.response });
      throw new FailedDependencyError(error.response ? error.response.data.message || error.response.statusText : error.message);
    }
  },

  async requestPayment(data: any) {
    try {
      const { requestReference, ...rest } = data;
      const { access_token: bearerToken } = await Service.createToken('collection');
      console.log({ requestReference, bearerToken, rest });
      const response = await Service.axiosInstance.post(
        '/collection/v1_0/requesttopay',
        { ...rest },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'X-Reference-Id': requestReference,
            'X-Target-Environment': `${Utils.getMoMoAuth().targetEnironment}`,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.log({ errors: error, error: error.config.headers, response: error.response });
      throw new FailedDependencyError(error.response ? error.response.data.message || error.response.statusText : error.message);
    }
  },

  async requestPaymentStatus(data: any) {
    const { requestReference } = data;
    const { access_token: bearerToken } = await Service.createToken('collection');
    const response = await Service.axiosInstance.get(`/collection/v1_0/requesttopay/${requestReference}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'X-Target-Environment': `${Utils.getMoMoAuth().targetEnironment}`,
      },
    });
    return response;
  },

  async accountBalance(data: any) {
    const { access_token: bearerToken } = await Service.createToken('collection');
    const response = await Service.axiosInstance.get(`/collection/v1_0/account/balance`, {
      Authorization: `Bearer ${bearerToken}`,
      'X-Target-Environment': `${Utils.getMoMoAuth().targetEnironment}`,
      'Ocp-Apim-Subscription-Key': `${Utils.getMoMoProductKeys().collection}`,
    });
    return response;
  },

  async confirmUser(data: any) {
    const { customerType = 'msisdn', customerPhone } = data;
    const { access_token: bearerToken } = await Service.createToken('collection');
    const response = await Service.axiosInstance.get(`/collection/v1_0/accountholder/${customerType}/${customerPhone}/active`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'X-Target-Environment': `${Utils.getMoMoAuth().targetEnironment}`,
      },
    });
    return response;
  },
};
export default Service;
