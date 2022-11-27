import { findMultipleCurrencies } from '../database/repositories/curencies.repo';
import { sendObjectResponse, oldSendObjectResponse, BadRequestException } from '../utils/errors';
import { theResponse } from '../utils/interface';

export const getCurrencies = async (): Promise<any> => {
  try {
    const existingCurrencies = await findMultipleCurrencies({}, [], ['Status', 'CurrencyRate', 'Scholarships']);
    if (existingCurrencies.length === 0) throw Error('Sorry, no business has been created');
    // console.log({ existingCurrencies });

    return sendObjectResponse('Currencies retrieved successfully', existingCurrencies);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Currencies retrieval failed, kindly try again');
  }
};
