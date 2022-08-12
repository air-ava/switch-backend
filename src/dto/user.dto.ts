import { Users } from '../database/models/users.model';
import { findAndCreatePhoneNumberDTO } from './helper.dto';

export interface createUserDTO {
  phone_number: findAndCreatePhoneNumberDTO;
  email: string;
  password: string;
  is_business?: boolean;
  first_name: string;
  last_name: string;
}

export interface createAddressDTO {
  user_id: number;
  is_business?: boolean;
  address: string;
  country: string;
  state: string;
  city: string;
  business_mobile?: string;
  wharehouse_mobile?: string;
  is_wharehouse?: boolean;
  default?: boolean;
}

export interface addressDataDTO {
  user?: Users;
  address: string;
  country: string;
  state: string;
  city: string;
  business_mobile?: string;
  type?: string;
}
