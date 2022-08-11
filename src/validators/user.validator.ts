/* eslint-disable max-classes-per-file */
import joi from 'joi';

export const registerValidator = joi.object().keys({
  phone_number: joi.string().regex(/^234[789][01]\d{8}$/),
  email: joi.string().email().required(),
  password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  is_business: joi.boolean().allow(null),
  first_name: joi.string().min(3).message('First Name must have more than 3 Characters').required(),
  last_name: joi.string().min(3).message('Last Name must have more than 3 Characters').required(),
});

export const shopperLoginValidator = joi.object().keys({
  email: joi.string().email().required(),
  password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
});
export interface Response {
  success: boolean;
  message?: string;
  error?: any;
}
