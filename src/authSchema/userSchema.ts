/* eslint-disable max-classes-per-file */
import joi from 'joi';

export const userSchema = joi.object().keys({
  phone_number: joi.string().regex(/^234[789][01]\d{8}$/),
  email: joi.string().email().required(),
  password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  is_business: joi.boolean().allow(null),
  first_name: joi.string().min(3).message('First Name must have more than 3 Characters').required(),
  last_name: joi.string().min(3).message('Last Name must have more than 3 Characters').required(),
  address: joi.string().min(3).required(),
  country: joi.string().min(3).required(),
  state: joi.string().min(3).required(),
  city: joi.string().min(3).required(),
  business_mobile: joi
    .string()
    .regex(/^234[789][01]\d{8}$/)
    .allow(null),
  default: joi.boolean().allow(null),
});

export const addressSchema = joi.object().keys({
  is_business: joi.boolean().allow(null),
  is_wharehouse: joi.boolean().allow(null),
  address: joi.string().min(3).required(),
  country: joi.string().min(3).required(),
  state: joi.string().min(3).required(),
  city: joi.string().min(3).required(),
  business_mobile: joi
    .string()
    .regex(/^234[789][01]\d{8}$/)
    .allow(null),
  wharehouse_mobile: joi
    .string()
    .regex(/^234[789][01]\d{8}$/)
    .allow(null),
  default: joi.boolean().allow(null),
});
export interface Response {
  success: boolean;
  message?: string;
  error?: any;
}
