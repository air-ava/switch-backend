import { Client } from 'africastalking-ts';
import { AFRICA_TALKING_API_KEY, NODE_ENV } from '../../utils/secrets';

const africastalking = new Client({
  apiKey: AFRICA_TALKING_API_KEY,
  username: NODE_ENV === 'local' ? 'sandbox' : 'stewardapp',
});

export const sendSms = async (payload: any): Promise<any> => {
  const { phoneNumber, message } = payload;
  try {
    const response = await africastalking.sendSms({
      to: [`${phoneNumber}`],
      message,
      from: 'STEWARD',
    });
    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.log({ error });
    // logger.error(error);
    return {
      success: false,
      error: error.response.data,
    };
  }
};
