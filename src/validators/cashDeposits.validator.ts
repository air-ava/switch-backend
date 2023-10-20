/* eslint-disable max-classes-per-file */
import joi from 'joi';

const classCode = joi.string().pattern(new RegExp('cll_.{17}$')).messages({
  'string.pattern.base': 'Invalid class code, should start with cll_',
});
const periodCode = joi.string().pattern(new RegExp('edp_.{17}$')).messages({
  'string.pattern.base': 'Invalid period code, should start with edp_',
});

const studentFeeCode = joi.string().pattern(new RegExp('bpy_.{17}$')).messages({
  'string.pattern.base': 'Invalid student fee code, should start with bpy_',
});

const cashDepositCode = joi.string().pattern(new RegExp('csd_.{17}$')).messages({
  'string.pattern.base': 'Invalid cash deposit code, should start with csd_',
});

const customDateValidator = (value: any, helpers: any) => {
  if (value.from && value.to && value.from >= value.to) {
    return helpers.message({ custom: '"from" date must be before the "to" date' });
  }
  return value;
};
const Validator = {
  depositCash: joi.object({
    periodCode: periodCode.optional(),
    classCode: classCode.optional(),
    studentFeeCode: studentFeeCode.required(),
    payerDetails: joi
      .object({
        name: joi.string().required(),
        phoneNumber: joi
          .string()
          .pattern(/^[0-9]+$/)
          .required(), // Assuming only numbers are allowed
        email: joi.string().email().optional(),
        gender: joi.string().valid('female', 'male').required(),
        relationship: joi.string().valid('parent', 'sibling', 'guardian', 'extended family', 'other').required(),
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
    bankName: joi.string().required(),
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
    status: joi.string().valid('deleted').optional(),
    ipAddress: joi.string().required(),
    code: cashDepositCode.required(),
    studentId: joi.string().min(9).optional(),
    studentFeeCode: studentFeeCode.optional(),
    payerDetails: joi
      .object({
        name: joi.string().optional(),
        phoneNumber: joi
          .string()
          .pattern(/^[0-9]+$/)
          .optional(), // Assuming only numbers are allowed
        email: joi.string().email().optional(),
        gender: joi.string().valid('female', 'male').required(),
        relationship: joi.string().valid('parent', 'sibling', 'guardian', 'extended family', 'other').required(),
      })
      .optional(),
    periodCode: periodCode.optional(),
    classCode: classCode.optional(),
    description: joi.string().optional(),
    notes: joi.string().optional(),
    recieptUrls: joi.array().items(joi.string().uri()).optional(),
    currency: joi.string().valid('UGX').optional(),
  }),

  listCashDeposit: joi
    .object({
      status: joi.string().valid('deleted', 'logged', 'unresolved', 'resolved', 'cancelled').optional(),
      approvalStatus: joi.string().valid('initiated', 'inactive', 'pending', 'approved', 'rejected').optional(),
      code: cashDepositCode.optional(),
      studentId: joi.string().min(9).optional(),
      studentFeeCode: studentFeeCode.optional(),
      periodCode: periodCode.optional(),
      classCode: classCode.optional(),
      from: joi.date().iso().optional().messages({
        'date.base': 'Invalid date format for "from". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
        'date.format': 'Invalid date format for "from". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
      }),
      to: joi.date().iso().optional().messages({
        'date.base': 'Invalid date format for "to". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
        'date.format': 'Invalid date format for "to". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
      }),
      page: joi.number().integer().min(1).optional().messages({
        'number.base': 'Invalid type for "page". Should be an integer.',
        'number.integer': 'Invalid type for "page". Should be an integer.',
        'number.min': 'The "page" number must be greater than or equal to 1.',
      }),
      perPage: joi.number().integer().min(1).max(100).optional().messages({
        'number.base': 'Invalid type for "perPage". Should be an integer.',
        'number.integer': 'Invalid type for "perPage". Should be an integer.',
        'number.min': 'The "perPage" value must be greater than or equal to 1.',
        'number.max': 'The "perPage" value must be less than or equal to 100.',
      }),
    })
    .custom(customDateValidator, 'Date validation'),

  getCashDeposit: joi.object({
    code: cashDepositCode.required(),
  }),
};

export default Validator;
