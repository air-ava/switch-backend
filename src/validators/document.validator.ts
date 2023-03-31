import joi from 'joi';

export const verifyDocument = joi.object().keys({
  status: joi.string().valid('approved', 'rejected').required(),
  reason: joi.string().optional(),
  documentId: joi.number().integer().required(),
});

export const listDocuments = joi.object().keys({
  process: joi.string().optional(),
  country: joi.string().valid('UGANDA').optional(),
  reference: joi.string().optional(),
});
