import joi from 'joi';

export const createProductValidator = joi.object().keys({
  name: joi.string().min(3).message('Product Name must have more than 3 Characters').required(),
  description: joi.string().min(10).optional(),
  images: joi.array().items(joi.string()).required(),
  business: joi.string().required(),
  product_categories: joi.number().integer().required(),
  unit_price: joi.number().min(1).required(),
  weight: joi.number().min(1).optional(),
  quantity: joi.number().min(1).optional(),
  unlimited: joi.boolean().optional(),
  publish: joi.boolean().optional(),
});

export const viewAllProductValidator = joi.object().keys({
  business: joi.string().required(),
  from: joi.string().optional(),
  to: joi.string().optional(),
  search: joi.string().optional(),
  quantity: joi.number().min(1).optional(),
});
