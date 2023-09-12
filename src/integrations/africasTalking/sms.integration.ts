import { Client } from 'africastalking-ts';
import { AFRICA_TALKING_API_KEY, AFRICA_TALKING_USERNAME } from '../../utils/secrets';
import ValidationError from '../../utils/validationError';
import Utils from '../../utils/utils';

const africastalking = new Client({
  apiKey: AFRICA_TALKING_API_KEY,
  username: AFRICA_TALKING_USERNAME,
});

export const sendSms = async (payload: any): Promise<any> => {
  const { phoneNumber, message } = payload;
  try {
    const to = Array.isArray(phoneNumber) ? phoneNumber.map(Utils.formatAndUpdatePhoneNumber) : [`${Utils.formatAndUpdatePhoneNumber(phoneNumber)}`];
    const response = await africastalking.sendSms({
      to,
      message,
      // from: 'STEWARD',
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
      error: error.response?.data,
    };
  }
};
