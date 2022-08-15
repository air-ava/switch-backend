import * as bcrypt from 'bcrypt';
import { theResponse } from '../utils/interface';
import { registerValidator, shopperLoginValidator, userAuthValidator } from '../validators/auth.validator';
import { BadRequestException, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { businessLoginDTO, createUserDTO, shopperLoginDTO, userAuthDTO } from '../dto/auth.dto';
import { findUser, createAUser } from '../database/repositories/user.repo';
import { findOrCreatePhoneNumber } from './helper.service';
import { sanitizeBusinesses, sanitizeUser } from '../utils/sanitize';
import { generateToken } from '../utils/jwt';
import { getBusinessesREPO, getOneBuinessREPO } from '../database/repositories/business.repo';

export const createUser = async (data: createUserDTO): Promise<theResponse> => {
  const validation = registerValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { is_business = false, email, phone_number: reqPhone, password, ...rest } = data;

  try {
    const userAlreadyExist = await findUser({ email }, []);
    if (userAlreadyExist) throw Error('Account already exists');

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

    const user = await findUser({ email }, [], ['phone']);
    if (!user) throw Error(`Sorry, Error creating Account`);

    const token = generateToken(user);

    return sendObjectResponse('Account created successfully', {
      user: sanitizeUser(user),
      token,
    });
  } catch (e: any) {
    return BadRequestException(e.message || 'Account creation failed, kindly try again', e);
  }
};

export const userAuth = async (data: userAuthDTO): Promise<theResponse> => {
  const validation = userAuthValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { email, password, addPhone } = data;

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

export const businessLogin = async (data: businessLoginDTO): Promise<theResponse> => {
  const validation = shopperLoginValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  try {
    const { data: user, success, error } = await userAuth({ ...data, addPhone: true });
    if (!success) throw Error(error);

    const businessAlreadyExist = await getBusinessesREPO({ owner: user.id }, ['name', 'description', 'reference']);
    if (!businessAlreadyExist) throw Error('Sorry, you have not created a business');

    const token = generateToken(user);

    return sendObjectResponse('Business Login successful', {
      user: sanitizeUser(user),
      business: sanitizeBusinesses(businessAlreadyExist),
      token,
    });
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message);
  }
};
