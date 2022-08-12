import { parsePhoneNumber } from 'libphonenumber-js';
import { theResponse } from '../utils/interface';
import { getOnePhoneNumber, createAPhoneNumber } from '../database/repositories/phoneNumber.repo';
import { phoneNumberValidator } from '../validators/phoneNumber.validator';
import { ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { findAndCreatePhoneNumberDTO } from '../dto/helper.dto';

export const findOrCreatePhoneNumber = async (phone: findAndCreatePhoneNumberDTO): Promise<theResponse> => {
  const { error } = phoneNumberValidator.validate(phone);
  if (error) return ResourceNotFoundError(error);

  const { countryCode, localFormat } = phone;
  const phoneNumber = await getOnePhoneNumber({ queryParams: phone });
  if (phoneNumber) return sendObjectResponse('Account created successfully', phoneNumber);

  const { number: internationalFormat } = parsePhoneNumber(localFormat, 'NG');
  const createdPhoneNumber = await createAPhoneNumber({
    queryParams: {
      countryCode,
      localFormat,
      internationalFormat: String(internationalFormat.replace('+', '')),
    },
  });
  return sendObjectResponse('Account created successfully', createdPhoneNumber);
};
