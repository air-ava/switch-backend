import * as bcrypt from 'bcrypt';
import { theResponse } from '../utils/interface';
import { registerValidator, shopperLoginValidator, userAuthValidator } from '../validators/auth.validator';
import { BadRequestException, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { createUserDTO, shopperLoginDTO, userAuthDTO } from '../dto/user.dto';
import { findUser, createAUser } from '../database/repositories/user.repo';
import { findOrCreatePhoneNumber } from './helper.service';
import { sanitizeUser } from '../utils/sanitize';
import { generateToken } from '../utils/jwt';

export const createUser = async (data: createUserDTO): Promise<theResponse> => {
  const validation = registerValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { is_business = false, email, phone_number: reqPhone, password, ...rest } = data;

  try {
    const userAlreadyExist = await findUser({ email }, []);
    if (userAlreadyExist) return BadRequestException('Account already exists');

    const {
      data: { id: phone_number },
    } = await findOrCreatePhoneNumber(reqPhone);
    // console.log({ newPhone });

    await createAUser({
      email,
      ...rest,
      phone_number,
      password: bcrypt.hashSync(password, 8),
      is_business,
    });

    return sendObjectResponse('Account created successfully');
  } catch (e: any) {
    return BadRequestException(e.message || 'Account creation failed, kindly try again', e);
  }
};

export const userAuth = async (data: userAuthDTO): Promise<theResponse> => {
  const validation = userAuthValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { email, password, addPhone } = data;
  console.log({ email, password, addPhone });

  try {
    const userAlreadyExist = await findUser({ email }, [], [addPhone && 'phone']);
    if (!userAlreadyExist) throw Error(`Your credentials are incorrect`);
    if (!userAlreadyExist.enabled) throw Error('Your account has been disabled');
    if (!userAlreadyExist.password) throw Error('Kindly set password');

    if (!bcrypt.compareSync(password, userAlreadyExist.password)) throw Error('Your credentials are incorrect');

    return sendObjectResponse('User Authenticated', userAlreadyExist);
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const shopperLogin = async (data: shopperLoginDTO): Promise<theResponse> => {
  const validation = shopperLoginValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  try {
    const { data: user, success, error, message } = await userAuth({ ...data, addPhone: true });
    if (!success) throw Error(error);

    const token = generateToken(user);

    return sendObjectResponse('Login successful', {
      user: sanitizeUser(user),
      token,
    });
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const businessLogin = async (data: createUserDTO): Promise<theResponse> => {
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
