import joi from 'joi';

export const makeOrderSchema = joi.object().keys({
  image_url: joi.string().regex(/^https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^/#?]+)+\.(?:jpg|jpeg|gif|png|bmp|tiff|tga|svg)$/),
  payment_reference: joi.string().required(),
  item_name: joi.string().required(),
  item_amount: joi.number().greater(10).required(),
  description: joi.string().min(3).message('description must have more than 3 Characters').required(),
  weight: joi.number().greater(0).allow(null),
  user_id: joi.number().required(),
  seller_id: joi.number().required(),
});

export const getOrderSchema = joi.string().required();

export const updateOrderSchema = joi.object().keys({
  reference: joi.string().required(),
});

export const trackerSchema = joi.object().keys({
  order_ref: joi.string().required(),
  address_id: joi.number().required(),
});
