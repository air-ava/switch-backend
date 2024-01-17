import joi from 'joi';

const feeCode = joi.string().pattern(new RegExp('shp_.{17}$')).required().messages({
  'string.pattern.base': 'Invalid fee code',
});

export const currencyCodes = joi.string().valid('UGX', 'NGN');

const schoolClassCode = joi.string().pattern(new RegExp('shc_.{17}$')).messages({
  'string.pattern.base': 'Invalid student class code',
});

const classCode = joi.string().pattern(new RegExp('cll_.{17}$')).messages({
  'string.pattern.base': 'Invalid class code',
});

export const getFeeValidator = joi.object().keys({ code: feeCode });
export const getFeesValidator = joi.object().keys({ feeCodes: joi.array().items(feeCode) });
export const getClassFeesValidator = joi.object().keys({ code: classCode.required() });
export const editFeeValidator = joi.object().keys({
  code: feeCode,
  classCode: schoolClassCode.optional(),
  status: joi.string().valid('active', 'inactive').optional(),
  currency: currencyCodes.optional(),
  description: joi.string().optional(),
  name: joi.string().optional(),
  amount: joi.number().positive().optional().min(10000).messages({
    'number.min': 'Minimum amount for a fee is 100',
  }),
  paymentType: joi.string().valid('install-mental', 'lump-sum', 'no-payment').optional(),
  feeType: joi.string().pattern(new RegExp('prt_.{17}$')).optional().messages({
    'string.pattern.base': 'Invalid fee type code',
  }),
  periodCode: joi.string().pattern(new RegExp('edp_.{17}$')).optional().messages({
    'string.pattern.base': 'Invalid period code',
  }),
});
