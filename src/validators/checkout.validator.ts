import joi from 'joi';

export const completeCheckoutValidator = joi.object().keys({
  cartReference: joi.string().required(),
  processor_reference: joi.string().required(),
  external_reference: joi.string().optional(),
  metadata: joi.object().optional(),
  processor_response: joi.string().optional(),
  shopper_address: joi.number().integer().required(),
  business_address: joi.number().integer().required(),
  shopper: joi.number().integer().required(),
  business: joi.string().required(),
});
