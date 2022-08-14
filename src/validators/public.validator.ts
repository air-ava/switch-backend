import joi from 'joi';

export const allBusinessAndProductsValidator = joi.object().keys({
  from: joi.string().optional(),
  to: joi.string().optional(),
  search: joi.string().optional(),
  quantity: joi.number().min(1).optional(),
});
