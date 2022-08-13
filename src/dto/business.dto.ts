import { findAndCreatePhoneNumberDTO } from './helper.dto';

export interface createBusinessDTO {
  phone_number: findAndCreatePhoneNumberDTO;
  description: string;
  name: string;
  logo?: string;
  owner?: number;
  //   owners_phone?: number;
}
