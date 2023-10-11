/* eslint-disable max-classes-per-file */
import joi from 'joi';

const classCode = joi.string().pattern(new RegExp('cll_.{17}$')).messages({
  'string.pattern.base': 'Invalid class code',
});
const periodCode = joi.string().pattern(new RegExp('shp_.{17}$')).messages({
  'string.pattern.base': 'Invalid period code',
});

const studentFeeCode = joi.string().pattern(new RegExp('bpy_.{17}$')).messages({
  'string.pattern.base': 'Invalid student fee code',
});

const cashDepositCode = joi.string().pattern(new RegExp('csd_.{17}$')).messages({
  'string.pattern.base': 'Invalid cash deposit code',
});

const Validator = {
  depositCash: joi.object({
    periodCode: periodCode.optional(),
    classCode: classCode.optional(),
    StudentFeeCode: studentFeeCode.required(),
    payerDetails: joi
      .object({
        name: joi.string().required(),
        phoneNumber: joi
          .string()
          .pattern(/^[0-9]+$/)
          .required(), // Assuming only numbers are allowed
        email: joi.string().email().optional(),
      })
      .required(),
    clientCordinate: joi
      .object({
        longitude: joi.string().required(),
        latitude: joi.string().required(),
      })
      .required(),
    recieptUrls: joi.array().items(joi.string().uri()).optional(),
    currency: joi.string().valid('UGX').required(),
    amount: joi.number().greater(10000).positive().required().messages({
      'number.positive': '"amount" should be a positive value.',
      'number.greater': '"amount" should be greater than 100.',
    }),
    studentId: joi.string().min(9).required(),
    ipAddress: joi.string().required(),
    description: joi.string().optional(),
    notes: joi.string().optional(), // assuming notes is optional
  }),

  recieptSubmission: joi.object({
    clientCordinate: joi
      .object({
        longitude: joi.string().required(),
        latitude: joi.string().required(),
      })
      .required(),
    recipts: joi.array().items(joi.string().uri()).optional(),
    cashDeposits: joi.array().items(cashDepositCode).required(),
    currency: joi.string().valid('UGX').optional(),
    ipAddress: joi.string().required(),
  }),

  reviewCashDeposit: joi.object({
    clientCordinate: joi
      .object({
        longitude: joi.string().required(),
        latitude: joi.string().required(),
      })
      .required(),
    status: joi.string().valid('approved', 'rejected').required(),
    ipAddress: joi.string().required(),
    transactionReference: joi.string().required(),
  }),

  updateCashDeposit: joi.object({
    clientCordinate: joi
      .object({
        longitude: joi.string().required(),
        latitude: joi.string().required(),
      })
      .required(),
    status: joi.string().valid('delete').optional(),
    ipAddress: joi.string().required(),
    code: cashDepositCode.required(),
    studentId: joi.string().min(9).optional(),
    StudentFeeCode: studentFeeCode.optional(),
    payerDetails: joi
      .object({
        name: joi.string().optional(),
        phoneNumber: joi
          .string()
          .pattern(/^[0-9]+$/)
          .optional(), // Assuming only numbers are allowed
        email: joi.string().email().optional(),
      })
      .optional(),
    periodCode: periodCode.optional(),
    classCode: classCode.optional(),
    recieptUrls: joi.array().items(joi.string().uri()).optional(),
  }),
};

export default Validator;
