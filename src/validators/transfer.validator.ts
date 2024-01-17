import joi from 'joi';
import Utils from '../utils/utils';

const senderAccountNumber = joi
  .string()
  .pattern(new RegExp(`${Utils.getWemaPrefix()}.{7}$`))
  .messages({ 'string.pattern.base': `Invalid sender account number` });
const recipientAccountNumber = joi
  .string()
  .regex(/^\d{10}$/)
  .message('Invalid recipient account number');
const bankCode = joi
  .string()
  .max(9)
  .min(3)
  .message('Invalid bank code');

const Validator = {
  verifyAccountDetails: joi.object({
    accountNumber: recipientAccountNumber.required(),
    bankCode: bankCode.required(),
  }),

  bankTransfer: joi.object({
    recipientAccountNumber: recipientAccountNumber.required(),
    recipientAccountName: joi.string().required(),
    senderAccountNumber: senderAccountNumber.required(),
    senderAccountName: joi.string().required(),
    narration: joi.string().required(),
    bankCode: bankCode.required(),
    transactionPin: joi
      .string()
      .regex(/^\d{5}$/)
      .message('No Transaction Pin')
      .required(),
    amount: joi.number().greater(10000).positive().required().messages({
      'number.positive': '"amount" should be a positive value.',
      'number.greater': '"amount" should be greater than 100.',
    }),
  }),
};

export default Validator;
