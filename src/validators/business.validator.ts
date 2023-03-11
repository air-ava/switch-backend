import joi from 'joi';

export const createBusinessValidator = joi.object().keys({
  phone_number: joi
    .object({
      countryCode: joi.string().required(),
      localFormat: joi.string().required(),
    })
    .required(),
  description: joi.string().min(50).optional(),
  logo: joi.string().uri().optional(),
  name: joi.string().min(3).message('Business Name must have more than 3 Characters').required(),
  owner: joi.number().integer().required(),
});

export const getBusinessValidator = joi.object().keys({
  reference: joi.string().required(),
  owner: joi.number().integer().required(),
});

export const updateBusinessValidator = joi.object().keys({
  reference: joi.string().required(),
  owner: joi.number().integer().required(),
  phone_number: joi
    .object({
      countryCode: joi.string().required(),
      localFormat: joi.string().required(),
    })
    .optional(),
  description: joi.string().min(50).optional(),
  logo: joi.string().uri().optional(),
  name: joi.string().min(3).message('Business Name must have more than 3 Characters').optional(),
});

export const viewAllBusinessValidator = joi.object().keys({
  owner: joi.number().integer().required(),
});
