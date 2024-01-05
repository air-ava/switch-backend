import joi from 'joi';

const Validator = {
  verifyAccountDetails: joi.object({
    accountNumber: joi
      .string()
      .regex(/^\d{10}$/)
      .message('Invalid account number')
      .required(),
    bankCode: joi
      .string()
      .regex(/^\d{6}$/)
      .message('Invalid bank code')
      .required(),
  }),
};

export default Validator;
