import joi from 'joi';

export const createAddressValidator = joi.object().keys({
  street: joi.string().min(3).required(),
  country: joi.string().min(3).required(),
  state: joi.string().min(3).required(),
  city: joi.string().min(3).required(),
  default: joi.boolean().optional(),
  is_business: joi.boolean().optional(),
});

export const getAddressValidator = joi.object().keys({
  reference: joi.string().optional(),
  owner: joi.number().integer().optional(),
});
