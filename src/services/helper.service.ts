import { Not } from 'typeorm';
import { theResponse } from '../utils/interface';
import { getOnePhoneNumber, createAPhoneNumber } from '../database/repositories/phoneNumber.repo';
import { ImageValidator, phoneNumberValidator } from '../validators/phoneNumber.validator';
import { ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { businessCheckerDTO, findAndCreateAddressDTO, findAndCreateImageDTO, findAndCreatePhoneNumberDTO } from '../dto/helper.dto';
import { formatPhoneNumber, randomstringGeenerator } from '../utils/utils';
import { createImageREPO, getOneImageREPO } from '../database/repositories/image.repo';
import { getOneBuinessREPO } from '../database/repositories/business.repo';
import {
  getOneAddressREPO,
  createAndGetAddressREPO,
  getAddressesREPO,
  updateAddressREPO,
  countAddressesREPO,
} from '../database/repositories/address.repo';

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
  const createdPhoneNumber = await getOnePhoneNumber({ queryParams: { internationalFormat: internationalFormat.replace('+', '') } });
  if (!createdPhoneNumber) throw Error('Sorry, problem with Phone Number creation');

  return sendObjectResponse('Account created successfully', createdPhoneNumber);
};

export const findOrCreateImage = async (payload: findAndCreateImageDTO): Promise<theResponse> => {
  const { error } = ImageValidator.validate(payload);
  if (error) return ResourceNotFoundError(error);

  const { url, table_type, table_id, reference: referenceImage } = payload;
  const existingImage = await getOneImageREPO(
    {
      url,
      table_type,
      table_id,
      available: true,
      ...(referenceImage && { reference: referenceImage }),
    },
    [],
  );
  if (existingImage) return sendObjectResponse('Image retrieved successfully', existingImage);

  const reference = referenceImage || randomstringGeenerator('image');
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

export const updateAddressDefault = async (payload: any): Promise<theResponse> => {
  const { shopper, business, address: defaultAddress } = payload;
  const addresses = await getAddressesREPO(
    {
      id: Not(defaultAddress),
      default: true,
      ...(business && { business }),
      ...(shopper && { shopper }),
    },
    [],
  );
  if (addresses)
    await Promise.all(
      addresses.map(async (address: any) => {
        await updateAddressREPO({ id: address.id }, { default: false });
      }),
    );

  return sendObjectResponse('Address Defaulted');
};

export const findOrCreateAddress = async (payload: findAndCreateAddressDTO): Promise<theResponse> => {
  const { street, country, state, city, shopper, business, default: isDefault } = payload;
  const query = {
    street,
    country,
    state,
    city,
    active: true,
    ...(shopper && { shopper }),
    ...(business && { business }),
  };
  const existingAddress = await getOneAddressREPO(query, []);
  if (existingAddress) return sendObjectResponse('Address retrieved successfully', existingAddress);

  const addressCount = await countAddressesREPO({
    active: true,
    ...(shopper && { shopper }),
    ...(business && { business }),
  });
  if (addressCount > 3) throw Error('Sorry, you have reached your address capacity');

  const createdAddress = await createAndGetAddressREPO({
    street,
    country,
    state,
    city,
    active: true,
    default: isDefault || false,
    ...(shopper && { shopper }),
    ...(business && { business }),
  });

  if (!createdAddress) throw Error('Sorry, problem with Address creation');

  await updateAddressDefault({
    ...(shopper && { shopper }),
    ...(business && { business }),
    address: createdAddress.id,
  });

  return sendObjectResponse('Address created successfully', createdAddress);
};

export const businessChecker = async (payload: businessCheckerDTO): Promise<theResponse> => {
  const { owner, reference } = payload;
  const businessAlreadyExist = await getOneBuinessREPO(
    {
      ...(owner && { owner }),
      ...(reference && { reference }),
    },
    [],
    ['image', 'phone'],
  );
  if (!businessAlreadyExist) throw Error('Sorry, you have not created a business');

  return sendObjectResponse('Business Exists', businessAlreadyExist);
};
