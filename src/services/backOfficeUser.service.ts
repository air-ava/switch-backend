import * as bcrypt from 'bcrypt';
import randomstring from 'randomstring';
import { theResponse } from '../utils/interface';
import BackOfficeUserRepo from '../database/repositories/backOfficeUser.repo';
import { IBackOfficeUsers } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { sendObjectResponse, BadRequestException } from '../utils/errors';
import { generateBackOfficeToken } from '../utils/jwt';
import { Sanitizer } from '../utils/sanitizer';
import { sendEmail } from '../utils/mailtrap';

const Service = {
  async createAdmin(data: any): Promise<theResponse> {
    const { password, email, role = 'ADMIN', ...rest } = data;
    const permitedRoles = ['ADMIN', 'SUPER-ADMIN'];
    if (!email.includes('@joinsteward.com')) throw Error(`Not permitted to Create an Account`);
    if (!permitedRoles.includes(role)) throw Error(`The only permited roles are ${permitedRoles}`);

    const userAlreadyExist: any = await BackOfficeUserRepo.findBackOfficeUser({ email }, []);
    if (userAlreadyExist) throw Error(`Account already exists`);

    const remember_token = randomstring.generate({ length: 6, charset: 'numeric' });
    const slug = randomstring.generate({ length: 8, capitalization: 'lowercase', charset: 'alphanumeric' });
    const passwordHash = bcrypt.hashSync(password, 8);

    const user = await BackOfficeUserRepo.saveABackOfficeUser({
      email,
      remember_token,
      slug,
      role,
      ...rest,
      password: passwordHash,
    });
    if (!user) throw Error(`Sorry, Error creating Account`);

    await sendEmail({
      recipientEmail: user.email,
      purpose: 'welcome_user',
      templateInfo: {
        otp: remember_token,
        firstName: ` ${user.name}`,
        userId: String(user.id),
      },
    });

    const token = generateBackOfficeToken(user);

    return sendObjectResponse('Account created successfully', { user, token });
  },

  async backOfficeUserAuth(data: any): Promise<theResponse> {
    // const validation = userAuthValidator.validate(data);
    // if (validation.error) return ResourceNotFoundError(validation.error);

    const { email, password } = data;

    try {
      const userAlreadyExist: any = await BackOfficeUserRepo.findBackOfficeUser({ email }, []);
      if (!userAlreadyExist) throw Error(`Your credentials are incorrect`);
      if (userAlreadyExist.status === STATUSES.INACTIVE) throw Error('Your account has been disabled');
      if (!userAlreadyExist.password) throw Error('Kindly set password');

      if (!bcrypt.compareSync(password, userAlreadyExist.password)) throw Error('Your credentials are incorrect');

      return sendObjectResponse('User Authenticated', userAlreadyExist);
    } catch (e: any) {
      return BadRequestException(e.message);
    }
  },

  async backOfficeUserLogin(data: any): Promise<any> {
    // const validation = shopperLoginValidator.validate(data);
    // if (validation.error) return ResourceNotFoundError(validation.error);

    try {
      const { data: user, success, error } = await Service.backOfficeUserAuth({ ...data });
      if (!success) throw Error(error);
      if (!user.email_verified_at) throw Error('This ADMIN account has not been verified');

      const token = generateBackOfficeToken(user);

      return sendObjectResponse('Login successful', {
        user: Sanitizer.sanitizeAdminUser(user),
        token,
      });
    } catch (e: any) {
      return BadRequestException(e.message);
    }
  },

  async backOfficeVerifyAccount(data: any): Promise<any> {
    // const validation = verifyUserValidator.validate(data);
    // if (validation.error) return ResourceNotFoundError(validation.error);

    const { id, token: remember_token } = data;
    try {
      const userAlreadyExist = id
        ? await BackOfficeUserRepo.findBackOfficeUser({ id }, [], [])
        : await BackOfficeUserRepo.findBackOfficeUser({ remember_token }, [], []);

      if (!userAlreadyExist) throw Error(`User Not Found`);
      if (userAlreadyExist.remember_token !== remember_token) throw Error(`Wrong Token`);

      await BackOfficeUserRepo.verifyBackOfficeUser(
        {
          remember_token,
          ...(id && { id }),
        },
        { email_verified_at: new Date(Date.now()) },
      );

      const token = generateBackOfficeToken(userAlreadyExist);
      return sendObjectResponse('Admin verified', { token });
    } catch (e: any) {
      console.log({ e });
      return BadRequestException(e.message);
    }
  },

  async listBackOfficeUser(data: any): Promise<any> {
    const users = await BackOfficeUserRepo.listBackOfficeUsers({ status: STATUSES.ACTIVE }, []);
    return sendObjectResponse('retrieved admin users', users);
  },
};

export default Service;
