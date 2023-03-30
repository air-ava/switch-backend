import joi from 'joi';

export const verifyDocument = joi.object().keys({
  status: joi.string().valid('approved', 'rejected').required(),
  reason: joi.string().optional(),
  documentId: joi.number().integer().required(),
});
