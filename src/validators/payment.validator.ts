/* eslint-disable max-classes-per-file */
import joi from 'joi';

export const updateBankTransfer = joi.object().keys({
  reference: joi.string().required(),
  status: joi.string().valid('PROCESSING', 'PROCESSED').required(),
});

export const completeBankTransfer = joi.object().keys({
  reference: joi.string().required(),
  user: joi.string().required(),
  bankDraftCode: joi.string().required(),
  documents: joi.array().items(joi.string()).required(),
  bankName: joi.string().required(),
  accountName: joi.string().required(),
  accountNumber: joi.string().required(),
});
