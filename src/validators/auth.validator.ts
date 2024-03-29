/* eslint-disable max-classes-per-file */
import joi from 'joi';

const passwordRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]*)(?=.*[!@#$%^&*_-])(?=.{8,})');
export const registerValidator = joi.object().keys({
  phone_number: joi
    .object({
      countryCode: joi.string().required(),
      localFormat: joi.string().required(),
    })
    .required(),
  email: joi.string().email().optional(),
  password: joi.string().pattern(passwordRegex).required(),
  country: joi.string().valid('UG', 'NG').required(),
  user_type: joi.string().valid('school', 'vendor').required(),
  // is_business: joi.boolean().allow(null),
  first_name: joi.string().min(3).message('First Name must have more than 3 Characters').required(),
  last_name: joi.string().min(3).message('Last Name must have more than 3 Characters').required(),
  business_name: joi.string().required(),
  organisation_email: joi.string().email().optional(),
});
// .when('.user_type', {
//   is: 'partner',
//   then: joi.object({
//     business_name: joi.string().required(),
//     organisation_email: joi.string().email().required(),
//   }),
// });

export const userAuthValidator = joi
  .object()
  .keys({
    email: joi.string().email().optional(),
    phone_number: joi
      .object({
        countryCode: joi.string().required(),
        localFormat: joi.string().required(),
      })
      .optional(),
    password: joi.string().pattern(passwordRegex).required(),
    addPhone: joi.boolean().allow(null),
  })
  .xor('phone_number', 'email');

export const resendToken = joi
  .object()
  .keys({
    email: joi.string().email().optional(),
    phone_number: joi
      .object({
        countryCode: joi.string().required(),
        localFormat: joi.string().required(),
      })
      .optional(),
  })
  .xor('phone_number', 'email');

export const shopperLoginValidator = joi
  .object()
  .keys({
    email: joi.string().email().optional(),
    phone_number: joi
      .object({
        countryCode: joi.string().required(),
        localFormat: joi.string().required(),
      })
      .optional(),
    password: joi.string().pattern(passwordRegex).required(),
  })
  .xor('phone_number', 'email');

export const forgotPasswordValidator = joi.object().keys({
  email: joi.string().email().optional(),
  phone_number: joi
    .object({
      countryCode: joi.string().required(),
      localFormat: joi.string().required(),
    })
    .optional(),
});

export const verifyUserValidator = joi.object().keys({
  id: joi.string().optional(),
  token: joi.string().length(6).required(),
});

export const newPasswordValidator = joi.object().keys({
  otp: joi
    .string()
    .length(5)
    .pattern(/^[0-9]+$/)
    .required(),
  email: joi.string().email().required(),
  password: joi.string().pattern(passwordRegex).required(),
});

export const changePasswordValidator = joi.object().keys({
  old_password: joi.string().pattern(passwordRegex).required(),
  password: joi.string().pattern(passwordRegex).required(),
  override: joi.boolean().optional(),
  userId: joi.string().required(),
});

export const resetPasswordValidator = joi.object().keys({
  id: joi.string().required(),
  password: joi.string().pattern(passwordRegex).required(),
});
export interface Response {
  success: boolean;
  message?: string;
  error?: any;
}
