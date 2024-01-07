import axios from 'axios';
import { encrypt } from './encryption';
import { FLUTTERWAVE_BASE_URL, FLUTTERWAVE_SECRET_KEY } from '../../utils/secrets';
import { IChargeCard } from '../../dto/cards.dto';
import logger from '../../utils/logger';

const axiosInstance = axios.create({
  baseURL: FLUTTERWAVE_BASE_URL,
  headers: {
    Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
  },
});

export async function initiateCharge({
  cardNumber,
  cvv,
  expiryMonth,
  expiryYear,
  currency = 'NGN',
  amount,
  email,
  redirectUrl,
  pin,
  reference,
  metadata,
}: IChargeCard): Promise<any> {
  try {
    const encryptedRequest = encrypt(
      JSON.stringify({
        card_number: cardNumber,
        cvv,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        currency,
        amount,
        email,
        tx_ref: reference,
        meta: metadata,
        ...(redirectUrl && { redirect_url: redirectUrl }),
        ...(pin && { authorization: { mode: 'pin', pin } }),
      }),
    );

    const { data } = await axiosInstance.post('/charges?type=card', { client: encryptedRequest });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    logger.error(error.response.data);
    return {
      success: false,
      error: error.response.data.message,
    };
  }
}

export async function validateCharge(reference: string, otp: string): Promise<any> {
  try {
    const { data } = await axiosInstance.post('/validate-charge', {
      otp,
      flw_ref: reference,
      type: 'card',
    });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response.data.message,
    };
  }
}

export async function verifyCharge(transactionId: string): Promise<any> {
  try {
    const { data } = await axiosInstance.get(`/transactions/${transactionId}/verify`);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response.data.message,
    };
  }
}

export const chargedTokenizedCard = async ({
  amount,
  token,
  userEmail,
  reference,
  metadata,
}: {
  amount: number;
  token: string;
  userEmail: string;
  reference: string;
  metadata: any;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const response = await axiosInstance.post('/tokenized-charges', {
      amount,
      email: userEmail,
      tx_ref: reference,
      token,
      currency: 'NGN',
      country: 'NG',
      meta: metadata,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response.data.message,
    };
  }
};
