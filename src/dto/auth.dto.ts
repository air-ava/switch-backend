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
  is_business?: boolean;
}
