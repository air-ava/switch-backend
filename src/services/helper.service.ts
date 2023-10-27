/* eslint-disable lines-between-class-members */
import { Not } from 'typeorm';
import { theResponse } from '../utils/interface';
import { getOnePhoneNumber, createAPhoneNumber } from '../database/repositories/phoneNumber.repo';
import { ImageValidator, phoneNumberValidator } from '../validators/phoneNumber.validator';
import { NotFoundError, ResourceNotFoundError, ValidationError, sendObjectResponse } from '../utils/errors';
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
import { saveThirdPartyLogsREPO } from '../database/repositories/thirdParty.repo';
import { sendSlackMessage } from '../integrations/extra/slack.integration';

export const findOrCreatePhoneNumber = async (phone: findAndCreatePhoneNumberDTO, remember_token?: string): Promise<theResponse> => {
  const { error } = phoneNumberValidator.validate(phone);
  if (error) throw new ValidationError(error.message);

  const { countryCode, localFormat } = phone;
  const internationalFormat = formatPhoneNumber(localFormat, countryCode);
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
  if (!createdPhoneNumber) throw new ValidationError('Sorry, problem with Phone Number creation');

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

  if (!createdAddress) throw new ValidationError('Sorry, problem with Address creation');

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
  if (!existingOrganisation) throw new NotFoundError('Organization');

  const foundSchool = await getSchool(
    { organisation_id: existingOrganisation.id },
    [],
    ['Address', 'phoneNumber', 'Organisation', 'Organisation.Owner', 'Logo', 'Organisation.Owner.phoneNumber'],
  );
  if (!foundSchool) throw new NotFoundError('School');

  return sendObjectResponse('Organisation retrieved successfully', { organisation: existingOrganisation, school: foundSchool });
};

export const listJobTitles = async (): Promise<theResponse> => {
  // const validation = getQuestionnaire.validate({ process, country });
  // if (validation.error) return ResourceNotFoundError(validation.error);

  const response = await listJobTitleREPO({}, []);
  return sendObjectResponse(`Job titles retrieved successfully`, response);
};

export class NotificationHandler {
  private event = 'payment.status.changed';
  private message = '';
  private endpoint = '';
  private school = 0;
  private schoolName = '';
  private endpoint_verb = 'POST';
  private status_code = '200';
  private payload = '';
  private provider_type = 'payment-provider';
  private provider = 'BEYONIC';
  private reference = '';
  private amount = '';
  private action = 'Required:Complete-Payment';
  private reason = 'Reason Not Stated';
  private thirdParty = '';
  private phoneNumber = '';
  private createdAt: Date | string = new Date();
  private event_type = 'webhook';
  private payment_type = 'mobile-money';

  withEvent(event: string): NotificationHandler {
    this.event = event;
    return this;
  }

  withMessage(message: string): NotificationHandler {
    this.message = message;
    return this;
  }

  withEndpoint(endpoint: string): NotificationHandler {
    this.endpoint = endpoint;
    return this;
  }

  withSchool(school: number): NotificationHandler {
    this.school = school;
    return this;
  }

  withSchoolName(schoolName: string): NotificationHandler {
    this.schoolName = schoolName;
    return this;
  }

  withEndpointVerb(endpoint_verb: string): NotificationHandler {
    this.endpoint_verb = endpoint_verb;
    return this;
  }

  withStatusCode(status_code: string): NotificationHandler {
    this.status_code = status_code;
    return this;
  }

  withPayload(payload: string): NotificationHandler {
    this.payload = payload;
    return this;
  }

  withProviderType(provider_type: string): NotificationHandler {
    this.provider_type = provider_type;
    return this;
  }

  withProvider(provider: string): NotificationHandler {
    this.provider = provider;
    return this;
  }

  withReference(reference: string): NotificationHandler {
    this.reference = reference;
    return this;
  }

  withAmount(amount: string): NotificationHandler {
    this.amount = amount;
    return this;
  }

  withAction(action: string): NotificationHandler {
    this.action = action;
    return this;
  }

  withReason(reason: string): NotificationHandler {
    this.reason = reason;
    return this;
  }

  withThirdParty(thirdParty: string): NotificationHandler {
    this.thirdParty = thirdParty;
    return this;
  }

  withEventType(event_type: string): NotificationHandler {
    this.event_type = event_type;
    return this;
  }

  withPaymentType(payment_type: string): NotificationHandler {
    this.payment_type = payment_type;
    return this;
  }

  withPhoneNumber(phoneNumber: string): NotificationHandler {
    this.phoneNumber = phoneNumber;
    return this;
  }

  withStartDate(start_date: string): NotificationHandler {
    this.createdAt = start_date;
    return this;
  }

  build(): any {
    return {
      event: this.event && this.event,
      message: this.message && this.message,
      endpoint: this.endpoint && this.endpoint,
      school: this.school && this.school,
      schoolName: this.schoolName && this.schoolName,
      endpoint_verb: this.endpoint_verb && this.endpoint_verb,
      status_code: this.status_code && this.status_code,
      payload: this.payload && this.payload,
      provider_type: this.provider_type && this.provider_type,
      provider: this.provider && this.provider,
      reference: this.reference && this.reference,
      amount: this.amount && this.amount,
      action: this.action && this.action,
      reason: this.reason && this.reason,
      thirdParty: this.thirdParty && this.thirdParty,
      createdAt: this.createdAt && this.createdAt,
      phoneNumber: this.phoneNumber && this.phoneNumber,
      event_type: this.event_type && this.event_type,
      payment_type: this.payment_type && this.payment_type,
    };
  }

  async logThirdPartyResponse(): Promise<any> {
    // Build the payload for saveThirdPartyLogsREPO
    const payload = this.build();

    // Call saveThirdPartyLogsREPO and return the result
    return saveThirdPartyLogsREPO(payload);
  }

  async sendSlackMessage(feature: string): Promise<any> {
    // Build the payload for sendSlackMessage
    const body = this.build();

    // Call sendSlackMessage and return the result
    return sendSlackMessage({ feature, body });
  }
}
