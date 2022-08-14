import { getQueryRunner } from '../database/helpers/db';
import { createBusinessREPO, getBusinessesREPO, getOneBuinessREPO, updateBusinessREPO } from '../database/repositories/business.repo';
import { createBusinessDTO, getBusinessDTO, updateBusinessDTO, viewAllBusinessDTO } from '../dto/business.dto';
import { ResourceNotFoundError, BadRequestException, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { randomstringGeenerator } from '../utils/utils';
import { createBusinessValidator, getBusinessValidator, updateBusinessValidator, viewAllBusinessValidator } from '../validators/business.validator';
import { businessChecker, findOrCreateImage, findOrCreatePhoneNumber } from './helper.service';

export const createBusiness = async (data: createBusinessDTO): Promise<theResponse> => {
  const validation = createBusinessValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { phone_number: businessMobile, logo: logoUrl, name, owner, ...rest } = data;
  const reference = randomstringGeenerator('business');

  const queryRunner = await getQueryRunner();
  try {
    await queryRunner.startTransaction();
    const businessAlreadyExist = await getOneBuinessREPO({ name, owner }, [], [], queryRunner);
    if (businessAlreadyExist) throw Error('Sorry, you own this business name already');

    const {
      data: { id: phone_number },
    } = await findOrCreatePhoneNumber(businessMobile);

    await createBusinessREPO(
      {
        name,
        ...rest,
        phone_number,
        owner: Number(owner),
        active: true,
        reference,
      },
      queryRunner,
    );

    await queryRunner.commitTransaction();

    if (logoUrl) {
      const business = await getOneBuinessREPO({ reference }, [], []);
      if (!business) throw Error('Sorry, problem with business creation');

      const {
        data: { id: logo },
      } = await findOrCreateImage({ url: logoUrl, table_type: 'business', table_id: business.id });
      await updateBusinessREPO({ reference }, { logo });
    }

    return sendObjectResponse('Business created successfully');
  } catch (e: any) {
    await queryRunner.rollbackTransaction();
    return BadRequestException('Business creation failed, kindly try again');
  } finally {
    await queryRunner.release();
  }
};

export const updateBusiness = async (data: updateBusinessDTO): Promise<theResponse> => {
  const validation = updateBusinessValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { owner, reference, phone_number: businessMobile, ...rest } = data;
  try {
    await businessChecker({ reference, owner: Number(owner) });

    let phone_number;
    if (businessMobile) {
      const { data: phoneData } = await findOrCreatePhoneNumber(businessMobile);
      phone_number = phoneData.id;
    }
    await updateBusinessREPO({ reference }, { ...rest, ...(phone_number && { phone_number }) });

    return sendObjectResponse('Business updated successfully');
  } catch (e: any) {
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};

export const getBusiness = async (data: getBusinessDTO): Promise<theResponse> => {
  const validation = getBusinessValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { reference, owner } = data;
  try {
    const existingCompany = await getOneBuinessREPO({ reference, owner }, ['name', 'description', 'reference'], ['phone', 'owners']);
    if (!existingCompany) throw Error('Sorry, can not find this business');

    return sendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};

export const viewAllBusiness = async (data: viewAllBusinessDTO): Promise<theResponse> => {
  const validation = viewAllBusinessValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { owner } = data;
  try {
    const existingCompany = await getBusinessesREPO({ owner }, ['name', 'description', 'reference'], ['phone', 'owners']);
    if (existingCompany.length === 0) throw Error('Sorry, we can not find any business');

    return sendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};

export const allBusiness = async (): Promise<theResponse> => {
  try {
    const existingCompany = await getBusinessesREPO({}, ['name', 'description', 'reference'], ['phone', 'owners']);
    if (existingCompany.length === 0) throw Error('Sorry, no business has been created');

    return sendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};
