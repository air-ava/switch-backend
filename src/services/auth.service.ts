/* eslint-disable array-callback-return */
import * as bcrypt from 'bcrypt';
import randomstring from 'randomstring';
// eslint-disable-next-line import/no-extraneous-dependencies
import otpGenerator from 'otp-generator';
import { theResponse } from '../utils/interface';
import {
  changePasswordValidator,
  forgotPasswordValidator,
  newPasswordValidator,
  registerValidator,
  resetPasswordValidator,
  shopperLoginValidator,
  userAuthValidator,
  verifyUserValidator,
} from '../validators/auth.validator';
import { BadRequestException, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import {
  businessLoginDTO,
  changePasswordDTO,
  createUserDTO,
  newPasswordDTO,
  resetPasswordDTO,
  shopperLoginDTO,
  userAuthDTO,
  verifyUserDTO,
} from '../dto/auth.dto';
import { findUser, createAUser, updateUser, verifyUser } from '../database/repositories/user.repo';
import { findOrCreateOrganizaton, findOrCreatePhoneNumber } from './helper.service';
import { sanitizeBusinesses, Sanitizer, sanitizeUser } from '../utils/sanitizer';
import { generateToken } from '../utils/jwt';
import { getBusinessesREPO } from '../database/repositories/business.repo';
import { sendEmail } from '../utils/mailtrap';
import { createPassword, findPasswords, updatePassword } from '../database/repositories/password.repo';
import { STATUSES } from '../database/models/status.model';
import { getOneOrganisationREPO, updateOrganisationREPO } from '../database/repositories/organisation.repo';
import { getSchool, saveSchoolsREPO } from '../database/repositories/schools.repo';
import { saveIndividual } from '../database/repositories/individual.repo';
import { Service as WalletService } from './wallet.service';
// import { IEmailMessage } from '../database/modelInterfaces';

export const createUser = async (data: createUserDTO): Promise<theResponse> => {
  const validation = registerValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const {
    // is_business = false,
    phone_number: reqPhone,
    email,
    password,
    user_type,
    organisation_email,
    business_name,
    ...rest
  } = data;

  try {
    const userAlreadyExist = await findUser({ email }, []);
    if (userAlreadyExist) throw Error('Account already exists');

    let phone_number;
    if (reqPhone) {
      const { data: phone } = await findOrCreatePhoneNumber(reqPhone);
      phone_number = phone.id;
    }

    // todo: put the token in redis and expire it
    const remember_token = randomstring.generate({ length: 6, capitalization: 'lowercase', charset: 'alphanumeric' });
    const slug = randomstring.generate({ length: 8, capitalization: 'lowercase', charset: 'alphanumeric' });
    const userTypeCheck = user_type === 'school';
    const passwordHash = bcrypt.hashSync(password, 8);

    let organisation: any;
    let school: any;
    if (userTypeCheck) {
      organisation = await findOrCreateOrganizaton({
        business_name,
        organisation_email,
        slug,
      });
      school = await saveSchoolsREPO({
        name: business_name,
        organisation_id: organisation.data.id,
      });
    }

    await createAUser({
      email,
      ...(phone_number && { phone_number }),
      ...(reqPhone && { code: reqPhone.countryCode }),
      ...(reqPhone && { phone: reqPhone.localFormat }),
      remember_token,
      user_type,
      ...(userTypeCheck && organisation_email && { organisation_email }),
      ...(userTypeCheck && business_name && { business_name }),
      ...(userTypeCheck && { slug }),
      ...rest,
      password: passwordHash,
      organisation: organisation.data.id,
    });

    const user = await findUser({ email }, ['id', 'email', 'first_name', 'last_name', 'other_name', 'created_at', 'updated_at'], ['phoneNumber']);
    if (!user) throw Error(`Sorry, Error creating Account`);
    await createPassword({ user: user.id, password: passwordHash });

    console.log({ user });
    const { first_name: firstName, last_name: lastName } = rest;
    if (userTypeCheck) {
      await updateOrganisationREPO({ id: organisation.data.id }, { owner: user.id });
      await saveIndividual({
        email,
        ...(phone_number && { phone_number }),
        firstName,
        lastName,
        school_id: school.id,
      });
    }

    // await sendEmail({
    //   recipientEmail: user.email,
    //   purpose: 'welcome_user',
    //   templateInfo: {
    //     code: remember_token,
    //     name: ` ${user.first_name}`,
    //     userId: user.id,
    //   },
    // });
    await sendEmail({
      recipientEmail: user.email,
      purpose: 'welcome_user',
      templateInfo: {
        otp: remember_token,
        firstName: ` ${user.first_name}`,
        userId: user.id,
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
    const userAlreadyExist: any = await findUser({ email }, [], [addPhone && 'phoneNumber']);
    if (!userAlreadyExist) throw Error(`Your credentials are incorrect`);
    // if (!userAlreadyExist.enabled) throw Error('Your account has been disabled');
    if (!userAlreadyExist.password) throw Error('Kindly set password');

    if (!bcrypt.compareSync(password, userAlreadyExist.password)) throw Error('Your credentials are incorrect');

    const organisation = await getOneOrganisationREPO({ id: userAlreadyExist.organisation }, []);
    if (organisation) {
      userAlreadyExist.Organisation = organisation as any;
      if (organisation) {
        const school = await getSchool({ organisation_id: organisation.id }, [], ['Logo']);
        if (school) userAlreadyExist.School = school as any;
      }
    }

    return sendObjectResponse('User Authenticated', userAlreadyExist);
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const resendVerifyToken = async (email: string): Promise<theResponse> => {
  try {
    const user = await findUser({ email }, []);
    if (!user) throw Error('Account Not Found');

    const remember_token = randomstring.generate({ length: 6, capitalization: 'lowercase', charset: 'alphanumeric' });
    updateUser({ id: user.id }, { remember_token });

    await sendEmail({
      recipientEmail: user.email,
      purpose: 'welcome_user',
      templateInfo: {
        code: remember_token,
        name: ` ${user.first_name}`,
      },
    });

    return sendObjectResponse('Token resent successfully');
  } catch (e: any) {
    return BadRequestException(e.message || 'Account creation failed, kindly try again', e);
  }
};

export const userLogin = async (data: shopperLoginDTO): Promise<any> => {
  const validation = shopperLoginValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  try {
    const { data: user, success, error } = await userAuth({ ...data, addPhone: true });
    if (!success) throw Error(error);
    if (!user.email_verified_at) throw Error('This account has not been verified');

    const token = generateToken(user);

    return sendObjectResponse('Login successful', {
      user: Sanitizer.sanitizeUser(user),
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
    const userAlreadyExist = id ? await findUser({ id }, [], []) : await findUser({ remember_token }, [], []);
    if (!userAlreadyExist) throw Error(`User Not Found`);
    if (userAlreadyExist.remember_token !== remember_token) throw Error(`Wrong Token`);

    const school = await getSchool({ organisation_id: userAlreadyExist.organisation }, []);
    if (!school) throw Error(`School not found`);

    await verifyUser(
      {
        remember_token,
        ...(id && { id }),
      },
      { email_verified_at: new Date(Date.now()) },
    );

    await WalletService.createDollarWallet({
      user: userAlreadyExist,
      currency: 'UGX',
      type: 'permanent',
      entity: 'school',
      entityId: school.id,
    });

    const token = generateToken(userAlreadyExist);
    return sendObjectResponse('user verified', { token });
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
    if (!userAlreadyExist) throw Error(`User Not found`);
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

export const changePassword = async (data: changePasswordDTO): Promise<any> => {
  const validation = changePasswordValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { password, old_password, override = false, userId: id } = data;
  try {
    const userAlreadyExist = await findUser({ id }, [], []);
    if (!userAlreadyExist) throw Error(`User Not found`);
    if (!bcrypt.compareSync(old_password, userAlreadyExist.password)) throw Error('Your credentials are incorrect');

    // const passwordExisit = bcrypt.compareSync(old_password, userAlreadyExist.password);
    const passwords = await findPasswords({ user: userAlreadyExist.id }, []);

    let identifiedPassword: string | any;
    const passwordIds: number[] = [];
    const checkedPassword: boolean[] = passwords.map((item: { [key: string]: any }) => {
      passwordIds.push(item.id);
      return bcrypt.compareSync(password, item.password);
    });
    if (!override && checkedPassword.includes(true)) throw Error(`You have used this password before`);
    if (override && checkedPassword.includes(true)) {
      await updatePassword({ id: passwordIds[checkedPassword.indexOf(true)] }, { status: STATUSES.ACTIVE });
      identifiedPassword = passwords[checkedPassword.indexOf(true)].password;
      passwordIds.splice(checkedPassword.indexOf(true), 1);
      passwordIds.map(async (item: number) => {
        await updatePassword({ id: item }, { status: STATUSES.INACTIVE });
      });
    }

    if (!identifiedPassword) {
      const passwordHash = bcrypt.hashSync(password, 8);
      await createPassword({ user: userAlreadyExist.id, password: passwordHash });
      identifiedPassword = passwordHash;
      passwordIds.map(async (item: number) => {
        await updatePassword({ id: item }, { status: STATUSES.INACTIVE });
      });
    }
    await updateUser({ id: userAlreadyExist.id }, { password: identifiedPassword });
    return sendObjectResponse('Password Changed Successfully', userAlreadyExist);
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
