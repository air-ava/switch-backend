import { findAndCreatePhoneNumberDTO } from './helper.dto';

export interface createBusinessDTO {
  phone_number: findAndCreatePhoneNumberDTO;
  description: string;
  name: string;
  logo?: string;
  owner?: number;
}

export interface updateBusinessDTO {
  owner: string;
  reference: string;
  phone_number?: findAndCreatePhoneNumberDTO;
  description?: string;
  name?: string;
  logo?: string;
}

export interface getBusinessDTO {
  reference: string;
  owner: string;
}

export interface viewAllBusinessDTO {
  owner: string;
}
