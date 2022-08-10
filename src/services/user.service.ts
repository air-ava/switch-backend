import * as bcrypt from 'bcrypt';
import { Users } from '../database/models/users.model';

import { theResponse } from '../utils/interface';
import { userSchema } from '../validators/user.validator';
import { ResourceNotFoundError } from '../utils/errors';
import { getQueryRunner } from '../database/helpers/db';
import { addressDataDTO, createUserDTO } from '../dto/user.dto';
// import { Addresses } from '../database/models/Addresses';

export const createUser = async (data: createUserDTO): Promise<theResponse> => {
  const validation = userSchema.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const queryRunner = await getQueryRunner();
  await queryRunner.startTransaction();

  try {
    const userAlreadyExist = await queryRunner.manager.findOne(Users, {
      where: [{ email: data.email }, { phone_number: data.phone_number }],
    });

    if (userAlreadyExist)
      return {
        success: false,
        message: 'Account already exists',
      };

    const user = await queryRunner.manager.save(Users, {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number.replace('+', ''),
      password: bcrypt.hashSync(data.password, 8),
    });

    const addressData: addressDataDTO = {
      user,
      address: data.address,
      country: data.country,
      state: data.state,
      city: data.city,
    };

    if (data.is_business) {
      if (!data.business_mobile)
        return {
          success: false,
          message: 'Add a business Mobile',
        };

      addressData.business_mobile = data.business_mobile;
      addressData.type = 'is_business';
    }

    // const address: Addresses = await queryRunner.manager.save(Addresses, addressData);

    // await queryRunner.manager.update(Users, { id: user.id }, { address });

    await queryRunner.commitTransaction();

    return {
      success: true,
      message: 'Account created successfully',
      // data: { address },
    };
  } catch (e) {
    await queryRunner.rollbackTransaction();
    console.log({ e });
    return {
      success: false,
      message: 'Account creation failed, kindly try again',
    };
  } finally {
    await queryRunner.release();
  }
};
