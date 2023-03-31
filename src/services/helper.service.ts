import { Not } from 'typeorm';
import { theResponse } from '../utils/interface';
import { getOnePhoneNumber, createAPhoneNumber } from '../database/repositories/phoneNumber.repo';
import { ImageValidator, phoneNumberValidator } from '../validators/phoneNumber.validator';
import { ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import {
  businessCheckerDTO,
  findAndCreateAddressDTO,
  findAndCreateAssetsDTO,
  findAndCreateImageDTO,
  findAndCreateOrganisationDTO,
  findAndCreatePhoneNumberDTO,
} from '../dto/helper.dto';
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
import { STATUSES } from '../database/models/status.model';
import { getOneAssetsREPO, createAssetsREPO } from '../database/repositories/assets.repo';
import { getOneOrganisationREPO, createOrganisationREPO } from '../database/repositories/organisation.repo';
import { getSchool } from '../database/repositories/schools.repo';
import { listJobTitleREPO } from '../database/repositories/jobTitle.repo';

export const findOrCreatePhoneNumber = async (phone: findAndCreatePhoneNumberDTO, remember_token?: string): Promise<theResponse> => {
  const { error } = phoneNumberValidator.validate(phone);
  if (error) return ResourceNotFoundError(error);

  const { countryCode, localFormat } = phone;
  const internationalFormat = formatPhoneNumber(localFormat);
  const phoneNumber = await getOnePhoneNumber({ queryParams: { internationalFormat: String(internationalFormat.replace('+', '')) } });
  if (phoneNumber)
    return sendObjectResponse('Phone numbers retrieved successfully', { ...phoneNumber, completeInternationalFormat: internationalFormat });

  await createAPhoneNumber({
    queryParams: {
      countryCode,
      localFormat,
      internationalFormat: String(internationalFormat.replace('+', '')),
      remember_token,
    },
  });
  const createdPhoneNumber = await getOnePhoneNumber({ queryParams: { internationalFormat: internationalFormat.replace('+', '') } });
  if (!createdPhoneNumber) throw Error('Sorry, problem with Phone Number creation');

  return sendObjectResponse('Account created successfully', { ...createdPhoneNumber, completeInternationalFormat: internationalFormat });
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

export const findOrCreateAssets = async (payload: findAndCreateAssetsDTO): Promise<theResponse> => {
  // const { error } = ImageValidator.validate(payload);
  // if (error) return ResourceNotFoundError(error);

  const { name, file_name, status, file_type, organisation, user } = payload;
  const existingAssets = await getOneAssetsREPO(
    {
      name,
      file_name,
      status,
      file_type,
      ...(organisation && { organisation }),
      ...(user && { user }),
    },
    [],
  );
  if (existingAssets) return sendObjectResponse('Asset retrieved successfully', existingAssets);

  await createAssetsREPO({
    name,
    file_name,
    status,
    file_type,
    ...(organisation && { organisation }),
    ...(user && { user }),
  });

  const createdImage = await getOneAssetsREPO(
    { name, file_name, status, file_type, ...(organisation && { organisation }), ...(user && { user }) },
    [],
  );
  if (!createdImage) throw Error('Sorry, problem with Image creation');

  return sendObjectResponse('Account created successfully', createdImage);
};

export const updateAddressDefault = async (payload: any): Promise<theResponse> => {
  const { shopper, business, address: defaultAddress } = payload;
  await getAddressesREPO(
    {
      id: Not(defaultAddress),
      default: true,
      ...(business && { business }),
      ...(shopper && { shopper }),
    },
    [],
  );

  return sendObjectResponse('Address Defaulted');
};

export const findOrCreateAddress = async (payload: findAndCreateAddressDTO): Promise<theResponse> => {
  const { street, country, state, city, area } = payload;
  const query = {
    street,
    country,
    state,
    city,
    // active: true,
  };
  const existingAddress = await getOneAddressREPO(query, []);
  if (existingAddress) return sendObjectResponse('Address retrieved successfully', existingAddress);

  const createdAddress = await createAndGetAddressREPO({
    street,
    country,
    state,
    city,
    status: STATUSES.ACTIVE,
    area,
  });

  if (!createdAddress) throw Error('Sorry, problem with Address creation');

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

export const findOrCreateOrganizaton = async (payload: findAndCreateOrganisationDTO): Promise<theResponse> => {
  // const { error } = ImageValidator.validate(payload);
  // if (error) return ResourceNotFoundError(error);

  const { business_name: name, organisation_email: email, slug, from = 'Business' } = payload;
  const existingOrganisation = await getOneOrganisationREPO({ name, status: STATUSES.ACTIVE }, []);
  if (existingOrganisation && existingOrganisation.email === email)
    return sendObjectResponse('Organisation retrieved successfully', existingOrganisation);
  if (existingOrganisation && existingOrganisation.name === name) throw Error(`${from} name already exists`);

  await createOrganisationREPO({ name, email, slug });

  const createdOrganisation = await getOneOrganisationREPO({ email, status: STATUSES.ACTIVE, slug }, []);
  if (!createdOrganisation) throw Error('Sorry, problem with Organisation creation');

  return sendObjectResponse('Organisation created successfully', createdOrganisation);
};

export const findSchoolWithOrganization = async (payload: { owner: string; email?: string }): Promise<theResponse> => {
  // const { error } = ImageValidator.validate(payload);
  // if (error) return ResourceNotFoundError(error);

  const { owner, email } = payload;
  const existingOrganisation = await getOneOrganisationREPO({ owner, ...(email && { email }), status: STATUSES.ACTIVE, type: 'school' }, []);
  if (!existingOrganisation) throw Error('Organization not found');

  const foundSchool = await getSchool(
    { organisation_id: existingOrganisation.id },
    [],
    ['Address', 'phoneNumber', 'Organisation', 'Organisation.Owner', 'Logo', 'Organisation.Owner.phoneNumber'],
  );
  if (!foundSchool) throw Error('School not found');

  return sendObjectResponse('Organisation retrieved successfully', { organisation: existingOrganisation, school: foundSchool });
};

export const listJobTitles = async (): Promise<theResponse> => {
  // const validation = getQuestionnaire.validate({ process, country });
  // if (validation.error) return ResourceNotFoundError(validation.error);

  const response = await listJobTitleREPO({}, []);
  return sendObjectResponse(`Job titles retrieved successfully`, response);
};
