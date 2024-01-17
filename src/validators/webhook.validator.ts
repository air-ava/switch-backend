import joi from 'joi';

export const accountNumberValidator = joi.object({
  accountnumber: joi
    .string()
    .regex(/^\d{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid authorization',
    }),
});

export const incomingDepositValidator = joi.object({
  originatoraccountnumber: joi
    .string()
    .regex(/^\d{10,11}$/)
    .required(),
  amount: joi.number().min(1).required(),
  originatorname: joi.string().required(),
  narration: joi.string().required(),
  craccountname: joi.string().required(),
  paymentreference: joi.string().required(),
  bankname: joi.string().required(),
  sessionid: joi.string().required(),
  craccount: joi
    .string()
    .regex(/^\d{10}$/)
    .required(),
  bankcode: joi.string().required(),
});
