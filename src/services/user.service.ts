import * as bcrypt from 'bcrypt';

import { theResponse } from '../utils/interface';
import { userSchema } from '../validators/user.validator';
import { BadRequestError, BadRequestException, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { createUserDTO } from '../dto/user.dto';
import { findUser, createAUser } from '../database/repositories/user.repo';
// import { Addresses } from '../database/models/Addresses';

export const createUser = async (data: createUserDTO): Promise<theResponse> => {
  const validation = userSchema.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { is_business = false, email, phone_number, password, ...rest } = data;

  try {
    const userAlreadyExist = await findUser({ email }, []);
    if (userAlreadyExist) return BadRequestException('Account already exists');

    await createAUser({
      email,
      ...rest,
      phone_number: phone_number.replace('+', ''),
      password: bcrypt.hashSync(password, 8),
      is_business,
    });

    return sendObjectResponse('Account created successfully');
  } catch (e) {
    return BadRequestException('Account creation failed, kindly try again', e);
  }
};
