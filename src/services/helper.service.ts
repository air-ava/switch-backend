import { parsePhoneNumber } from 'libphonenumber-js';
import { theResponse } from '../utils/interface';
import { getOnePhoneNumber, createAPhoneNumber } from '../database/repositories/phoneNumber.repo';
import { ImageValidator, phoneNumberValidator } from '../validators/phoneNumber.validator';
import { BadRequestException, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { businessCheckerDTO, findAndCreateImageDTO, findAndCreatePhoneNumberDTO } from '../dto/helper.dto';
import { formatPhoneNumber, randomstringGeenerator } from '../utils/utils';
import { createImageREPO, getOneImageREPO } from '../database/repositories/image.repo';
import { getBusinessesREPO, getOneBuinessREPO } from '../database/repositories/business.repo';

export const findOrCreatePhoneNumber = async (phone: findAndCreatePhoneNumberDTO): Promise<theResponse> => {
  const { error } = phoneNumberValidator.validate(phone);
  if (error) return ResourceNotFoundError(error);

  const { countryCode, localFormat } = phone;
  const phoneNumber = await getOnePhoneNumber({ queryParams: phone });
  if (phoneNumber) return sendObjectResponse('Phone numbers retrieved successfully', phoneNumber);

  const internationalFormat = formatPhoneNumber(localFormat);
  await createAPhoneNumber({
    queryParams: {
      countryCode,
      localFormat,
      internationalFormat: String(internationalFormat.replace('+', '')),
    },
  });
  const createdPhoneNumber = await getOnePhoneNumber({ queryParams: { internationalFormat } });
  if (!createdPhoneNumber) throw Error('Sorry, problem with Phone Number creation');

  return sendObjectResponse('Account created successfully', createdPhoneNumber);
};

export const findOrCreateImage = async (payload: findAndCreateImageDTO): Promise<theResponse> => {
  const { error } = ImageValidator.validate(payload);
  if (error) return ResourceNotFoundError(error);

  const { url, table_type, table_id } = payload;
  const existingImage = await getOneImageREPO(
    {
      url,
      table_type,
      table_id,
      available: true,
    },
    [],
  );
  if (existingImage) return sendObjectResponse('Image retrieved successfully', existingImage);

  const reference = randomstringGeenerator(table_type as 'image' | 'business' | 'cart' | 'order' | 'product' | 'transactions');
  await createImageREPO({
    url,
    table_type,
    table_id,
    available: true,
    reference,
  });

  const createdImage = await getOneImageREPO({ reference }, []);
  if (!createdImage) throw Error('Sorry, problem with Image creation');

  return sendObjectResponse('Account created successfully', createdImage);
};

export const businessChecker = async (payload: businessCheckerDTO): Promise<theResponse> => {
  const { owner, reference } = payload;
  const businessAlreadyExist = await getOneBuinessREPO(
    {
      ...(owner && { owner }),
      ...(reference && { reference }),
    },
    ['name', 'description', 'reference'],
  );
  if (!businessAlreadyExist) throw Error('Sorry, you have not created a business');

  return sendObjectResponse('Business Exists', businessAlreadyExist);
};
