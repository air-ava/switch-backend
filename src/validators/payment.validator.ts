/* eslint-disable max-classes-per-file */
import joi from 'joi';

export const updateBankTransfer = joi.object().keys({
  reference: joi.string().required(),
  status: joi.string().valid('PROCESSING', 'PROCESSED').required(),
});
