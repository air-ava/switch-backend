import joi from 'joi';

export const verifyAccountDetailsValidator = joi.object({
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
});

const Validator = {
  verifyAccountDetails: verifyAccountDetailsValidator,
};

export default Validator;
