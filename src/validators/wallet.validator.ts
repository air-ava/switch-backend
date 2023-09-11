/* eslint-disable max-classes-per-file */
import joi from 'joi';

export const freezeWalletValidator = joi.object({
  freeze: joi.boolean().required(),
  uniquePaymentId: joi.string().required(),
});
