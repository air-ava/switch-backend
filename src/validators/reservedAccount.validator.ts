import joi from 'joi';

export const creditWalletOnReservedAccountFundingSCHEMA = joi.object().keys({
  originator_account_number: joi
    .string()
    .regex(/^\d{10}$/)
    .required(),
  amount: joi.number().integer().min(100).required(),
  originator_account_name: joi.string().required(),
  narration: joi.string().required(),
  reserved_account_name: joi.string().required(),
  reserved_account_number: joi
    .string()
    .regex(/^\d{10}$/)
    .required(),
  external_reference: joi.string().required(),
  bank_name: joi.string().required(),
  session_id: joi.string().required(),
  bank_code: joi.string().required(),
  amountInKobo: joi.boolean().optional(),
});
