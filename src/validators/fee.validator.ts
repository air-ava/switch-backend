import joi from 'joi';

const feeCode = joi.string().pattern(new RegExp('shp_.{17}$')).required().messages({
  'string.pattern.base': 'Invalid fee code',
});

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
  schoolCode: schoolClassCode.optional(),
  paymentType: joi.string().pattern(new RegExp('fee_.{17}$')).required().messages({
    'string.pattern.base': 'Invalid payment type code',
  }),
  productType: joi.string().pattern(new RegExp('fee_.{17}$')).required().messages({
    'string.pattern.base': 'Invalid fee type code',
  }),
});
