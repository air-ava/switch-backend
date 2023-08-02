import randomstring from 'randomstring';
import { sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { v4 } from 'uuid';
import MoMoIntegrator from '../integrations/mtn/momo.integrations';

const Service = {
  async requestPayment(data: any): Promise<theResponse> {
    // const requestReference = `momo_${randomstring.generate({ length: 18, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
    const requestReference = v4();
    const paymentRequest = await MoMoIntegrator.requestPayment({ requestReference, ...data });
    console.log({ paymentRequest });
    // const paymentRequest = await MoMoIntegrator.createToken('collection');
    return sendObjectResponse('Crons list retrieved Successfully', paymentRequest);
  },
};

export default Service;
