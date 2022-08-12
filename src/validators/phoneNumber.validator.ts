/* eslint-disable max-classes-per-file */
import joi from 'joi';

export const phoneNumberValidator = joi.object({
  countryCode: joi.string().valid('234').max(3).message('Your country is not supported').required(),
  localFormat: joi.string().required(),
});
