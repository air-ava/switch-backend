import * as bcrypt from 'bcrypt';
import { theResponse } from '../utils/interface';
import { registerValidator, shopperLoginValidator } from '../validators/user.validator';
import { BadRequestException, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { createUserDTO } from '../dto/user.dto';
import { findUser, createAUser } from '../database/repositories/user.repo';
// import { Addresses } from '../database/models/Addresses';

export const createUser = async (data: createUserDTO): Promise<theResponse> => {
  const validation = registerValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { is_business = false, email, phone_number, password, ...rest } = data;

  try {
    const userAlreadyExist = await findUser([{ email }, { phone_number }], []);
    if (userAlreadyExist) return BadRequestException('Account already exists');

    await createAUser({
      email,
      ...rest,
      phone_number: phone_number.replace('+', ''),
      password: bcrypt.hashSync(password, 8),
      is_business,
    });

    return sendObjectResponse('Account created successfully');
  } catch (e: any) {
    return BadRequestException('Account creation failed, kindly try again');
  }
};

export const shopperLogin = async (data: createUserDTO): Promise<theResponse> => {
  const validation = shopperLoginValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { email, password } = data;

  try {
    const userAlreadyExist = await findUser({ email }, []);
    if (!userAlreadyExist) throw Error(`Your credentials are incorrect`);
    if (!userAlreadyExist.enabled) throw Error('Your account has been disabled');
    if (!userAlreadyExist.password) throw Error('Kindly set password');

    if (!bcrypt.compareSync(password, userAlreadyExist.password)) throw Error('Your credentials are incorrect');

    return sendObjectResponse('Login successful', userAlreadyExist);
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};
