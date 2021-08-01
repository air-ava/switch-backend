import * as bcrypt from 'bcrypt';
import { Users } from '../database/models/Users';

import { theResponse } from '../utils/interface';
import { addressSchema, userSchema } from '../authSchema/userSchema';
import { ResourceNotFoundError } from '../utils/errors';
import { getQueryRunner } from '../database/helpers/db';
import { addressDataDTO, createAddressDTO, createUserDTO } from './dto/userDTO';
import { Addresses } from '../database/models/Addresses';

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

    const address: Addresses = await queryRunner.manager.save(Addresses, addressData);

    await queryRunner.manager.update(Users, { id: user.id }, { address });

    await queryRunner.commitTransaction();
    const { password, ...newUser } = address.user;

    return {
      success: true,
      message: 'Account created successfully',
      data: { ...newUser },
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

export const createAddress = async (data: createAddressDTO): Promise<theResponse> => {
  const validation = addressSchema.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const queryRunner = await getQueryRunner();
  await queryRunner.startTransaction();

  try {
    const addressData: addressDataDTO = {
      address: data.address,
      country: data.country,
      state: data.state,
      city: data.city,
    };

    if (data.user_id) {
      const user = await queryRunner.manager.findOne(Users, {
        where: [{ id: data.user_id }],
      });
      addressData.user = user;
    }

    if (data.is_business) {
      if (!data.business_mobile)
        return {
          success: false,
          message: 'Add a business Mobile',
        };

      addressData.business_mobile = data.business_mobile;
      addressData.type = 'is_business';
    }

    if (data.is_wharehouse) {
      if (!data.wharehouse_mobile)
        return {
          success: false,
          message: 'Add a Wharehouse Mobile',
        };

      if (data.is_business || data.business_mobile)
        return {
          success: false,
          message: 'Wharehouse can not also be business ',
        };
      addressData.type = 'is_wharehouse';
      addressData.business_mobile = data.wharehouse_mobile;
    }

    const address = await queryRunner.manager.save(Addresses, addressData);

    await queryRunner.commitTransaction();

    return {
      success: true,
      message: 'Address created successfully',
      data: { ...address },
    };
  } catch (e) {
    await queryRunner.rollbackTransaction();
    console.log({ e });
    return {
      success: false,
      message: 'Address creation failed, kindly try again',
    };
  } finally {
    await queryRunner.release();
  }
};
