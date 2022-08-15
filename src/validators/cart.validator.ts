import joi from 'joi';

export const createCartValidator = joi.object().keys({
  products: joi
    .object({
      quantity: joi.number().integer().required(),
      items: joi.string().required(),
    })
    .required(),
  shopper: joi.number().integer().required(),
  business: joi.string().required(),
});

export const updateCartValidator = joi.object().keys({
  products: joi
    .object({
      quantity: joi.number().integer().required(),
      items: joi.string().required(),
    })
    .required(),
  cart: joi
    .object({
      id: joi.number().integer().required(),
      reference: joi.string().required(),
    })
    .required(),
});

export const getShopperCartValidator = joi.object().keys({
  reference: joi.string().required(),
  shopper: joi.number().integer().required(),
});

export const getBusinessCartValidator = joi.object().keys({
  reference: joi.string().optional(),
  owner: joi.number().integer().required(),
  business: joi.string().required(),
});
