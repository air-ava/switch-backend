import { Users } from '../database/models/users.model';
import { findAndCreatePhoneNumberDTO } from './helper.dto';

export interface shopperLoginDTO {
  email: string;
  password: string;
}

export interface businessLoginDTO {
  email: string;
  password: string;
}

export interface verifyUserDTO {
  id?: string;
  token: string;
}

export interface newPasswordDTO {
  otp: string;
  email: string;
  password: string;
}

export interface changePasswordDTO {
  old_password: string;
  password: string;
  override: boolean;
  userId: number;
}
export interface resetPasswordDTO {
  id: string;
  password: string;
}
export interface userAuthDTO {
  email: string;
  password: string;
  addPhone?: boolean;
}

export interface createUserDTO {
  phone_number: findAndCreatePhoneNumberDTO;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: string;
  business_name?: string;
  organisation_email?: string;
  country: string;
  // is_business?: boolean;
}
