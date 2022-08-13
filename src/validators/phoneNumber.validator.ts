/* eslint-disable max-classes-per-file */
import joi from 'joi';

export const phoneNumberValidator = joi.object({
  countryCode: joi.string().valid('234').max(3).message('Your country is not supported').required(),
  localFormat: joi.string().required(),
});

export const ImageValidator = joi.object({
  url: joi.string().uri().required(),
  table_type: joi.string().valid('image', 'business', 'cart', 'order', 'product', 'transactions').required(),
  table_id: joi.number().integer().required(),
});
