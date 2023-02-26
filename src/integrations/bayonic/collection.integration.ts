import axios from 'axios';
import logger from '../../utils/logger';
import { BAYONIC_BASE_URL, BAYONIC_KEY } from '../../utils/secrets';

const axiosInstance = axios.create({
  baseURL: BAYONIC_BASE_URL,
  headers: {
    Authorization: `Token ${BAYONIC_KEY}`,
  },
});

export const initiateCollection = async (payload: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('collectionrequests', payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    logger.error(error);
    return {
      success: false,
      error: error.response.data,
    };
  }
};