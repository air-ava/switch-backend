import { getQueryRunner } from '../database/helpers/db';
import { createBusinessREPO, getOneBuinessREPO, updateBusinessREPO } from '../database/repositories/business.repo';
import { createBusinessDTO } from '../dto/business.dto';
import { ResourceNotFoundError, BadRequestException, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { randomstringGeenerator } from '../utils/utils';
import { createBusinessValidator } from '../validators/business.validator';
import { findOrCreateImage, findOrCreatePhoneNumber } from './helper.service';

export const createBusiness = async (data: createBusinessDTO): Promise<theResponse> => {
  const validation = createBusinessValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { phone_number: businessMobile, logo: logoUrl, name, owner, ...rest } = data;
  const reference = randomstringGeenerator('business');

  const queryRunner = await getQueryRunner();
  try {
    await queryRunner.startTransaction();
    const businessAlreadyExist = await getOneBuinessREPO({ name, owner }, [], [], queryRunner);
    if (businessAlreadyExist) return BadRequestException('Sorry, you own this business name already');

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
      if (!business) return BadRequestException('Sorry, problem with business creation');

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
