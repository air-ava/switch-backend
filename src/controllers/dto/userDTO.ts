import { Users } from '../../database/models/Users';

export interface createUserDTO {
  phone_number: string;
  email: string;
  password: string;
  is_business?: boolean;
  first_name: string;
  last_name: string;
  address: string;
  country: string;
  state: string;
  city: string;
  business_mobile?: string;
  type?: string;
  default?: boolean;
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
