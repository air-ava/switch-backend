import * as bcrypt from 'bcrypt';
import randomstring from 'randomstring';
// eslint-disable-next-line import/no-extraneous-dependencies
import otpGenerator from 'otp-generator';
import { theResponse } from '../utils/interface';
import {
  forgotPasswordValidator,
  newPasswordValidator,
  registerValidator,
  resetPasswordValidator,
  shopperLoginValidator,
  userAuthValidator,
  verifyUserValidator,
} from '../validators/auth.validator';
import { BadRequestException, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { businessLoginDTO, createUserDTO, newPasswordDTO, resetPasswordDTO, shopperLoginDTO, userAuthDTO, verifyUserDTO } from '../dto/auth.dto';
import { findUser, createAUser, updateUser, verifyUser } from '../database/repositories/user.repo';
import { findOrCreatePhoneNumber } from './helper.service';
import { sanitizeBusinesses, sanitizeUser } from '../utils/sanitizer';
import { generateToken } from '../utils/jwt';
import { getBusinessesREPO, getOneBuinessREPO } from '../database/repositories/business.repo';
import { sendEmail } from '../utils/mailtrap';
// import { IEmailMessage } from '../database/modelInterfaces';

export const createUser = async (data: createUserDTO): Promise<theResponse> => {
  const validation = registerValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const {
    // is_business = false,
    phone_number: reqPhone,
    email,
    password,
    ...rest
  } = data;

  try {
    const userAlreadyExist = await findUser({ email }, []);
    if (userAlreadyExist) throw Error('Account already exists');

    const {
      data: { id: phone_number },
    } = await findOrCreatePhoneNumber(reqPhone);

    const { countryCode: code, localFormat: phone } = reqPhone;

    // todo: put the token in redis and expire it
    const remember_token = randomstring.generate({ length: 8, capitalization: 'lowercase', charset: 'alphanumeric' });

    await createAUser({
      email,
      phone_number,
      code,
      phone,
      remember_token,
      ...rest,
      password: bcrypt.hashSync(password, 8),
    });

    const user = await findUser({ email }, [], ['phoneNumber']);
    if (!user) throw Error(`Sorry, Error creating Account`);

    await sendEmail({
      recipientEmail: user.email,
      purpose: 'welcome_user',
      templateInfo: {
        code: remember_token,
        name: ` ${user.first_name}`,
      },
    });

    const token = generateToken(user);

    return sendObjectResponse('Account created successfully', { user: sanitizeUser(user), token });
  } catch (e: any) {
    return BadRequestException(e.message || 'Account creation failed, kindly try again', e);
  }
};

export const userAuth = async (data: userAuthDTO): Promise<theResponse> => {
  const validation = userAuthValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { email, password, addPhone } = data;

  try {
    const userAlreadyExist = await findUser({ email }, [], [addPhone && 'phoneNumber']);
    if (!userAlreadyExist) throw Error(`Your credentials are incorrect`);
    // if (!userAlreadyExist.enabled) throw Error('Your account has been disabled');
    if (!userAlreadyExist.password) throw Error('Kindly set password');

    if (!bcrypt.compareSync(password, userAlreadyExist.password)) throw Error('Your credentials are incorrect');

    return sendObjectResponse('User Authenticated', userAlreadyExist);
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const userLogin = async (data: shopperLoginDTO): Promise<theResponse> => {
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

export const verifyAccount = async (data: verifyUserDTO): Promise<theResponse> => {
  const validation = verifyUserValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { id, token: remember_token } = data;
  try {
    const userAlreadyExist = await findUser({ id }, [], []);
    if (!userAlreadyExist) throw Error(`User Not Found`);
    if (userAlreadyExist.remember_token !== remember_token) throw Error(`Wrong Token`);

    await verifyUser(
      {
        remember_token,
        id,
      },
      { email_verified_at: new Date(Date.now()) },
    );

    const token = generateToken(userAlreadyExist);
    return sendObjectResponse('user verified', {
      token,
    });
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message);
  }
};

export const newPassword = async (data: newPasswordDTO): Promise<theResponse> => {
  const validation = newPasswordValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { email, password, otp: remember_token } = data;
  try {
    const userAlreadyExist = await findUser({ email }, [], []);
    if (!userAlreadyExist) throw Error(`Wrong Token`);
    if (!userAlreadyExist.remember_token) throw Error(`You have not initiated forgot password`);
    if (userAlreadyExist.remember_token !== remember_token) throw Error(`Wrong OTP`);

    // todo: check time of OTP expiry
    // todo: move the OTP thingy to redis

    await updateUser({ id: userAlreadyExist.id }, { remember_token: null, password: bcrypt.hashSync(password, 8) });

    return sendObjectResponse('Password Change Completed');
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message);
  }
};

export const resetPassword = async (data: resetPasswordDTO): Promise<theResponse> => {
  const validation = resetPasswordValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { id, password } = data;
  try {
    const userAlreadyExist = await findUser({ id }, [], []);
    if (!userAlreadyExist) throw Error(`Wrong Token`);

    await updateUser({ id: userAlreadyExist.id }, { password: bcrypt.hashSync(password, 8) });

    return sendObjectResponse('Password Reset Completed');
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message);
  }
};

export const forgotPassword = async (data: { email: string }): Promise<theResponse> => {
  const validation = forgotPasswordValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { email } = data;
  try {
    const userAlreadyExist = await findUser({ email }, [], []);
    if (!userAlreadyExist) throw Error(`User Not Found`);

    const otp = otpGenerator.generate(5, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    await updateUser({ id: userAlreadyExist.id }, { remember_token: otp });

    await sendEmail({
      recipientEmail: userAlreadyExist.email,
      purpose: 'welcome_user',
      templateInfo: {
        code: otp,
        name: ` ${userAlreadyExist.first_name}`,
      },
    });

    return sendObjectResponse(`OTP sent to ${userAlreadyExist.email}`);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message);
  }
};
