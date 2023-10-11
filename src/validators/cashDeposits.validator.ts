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
        email: joi.string().email().required(),
      })
      .required(),
    clientCordinate: joi
      .object({
        longitude: joi.string().required(), // This is a simple regex for latitude and longitude. You can modify it to better suit your needs.
        latitude: joi.string().required(),
      })
      .required(),
    recieptUrls: joi.array().items(joi.string().uri()).optional(),
    currency: joi.string().valid('UGX').required(), // Only allows 'UGX'
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
        longitude: joi.string().required(), // This is a simple regex for latitude and longitude. You can modify it to better suit your needs.
        latitude: joi.string().required(),
      })
      .required(),
    recipts: joi.array().items(joi.string().uri()).optional(),
    cashDeposits: joi.array().items(cashDepositCode).required(),
    currency: joi.string().valid('UGX').optional(), // Only allows 'UGX'
    ipAddress: joi.string().required(),
  }),
};

export default Validator;
