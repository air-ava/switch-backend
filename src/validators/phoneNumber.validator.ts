/* eslint-disable max-classes-per-file */
import joi from 'joi';

export const phoneNumberValidator = joi.object({
  countryCode: joi.string().required(),
  localFormat: joi.string().required(),
});

export const phoneValidator = joi.object({
  phone: joi
    .string()
    .regex(/^256\d{9}$/)
    .message('Please enter a valid Ugandan phone number with the country code (256)')
    .required(),
});

export const ImageValidator = joi.object({
  url: joi.string().uri().required(),
  table_type: joi.string().valid('image', 'business', 'cart', 'order', 'product', 'transactions').required(),
  table_id: joi.number().integer().required(),
  reference: joi.string().optional(),
});
