import joi from 'joi';

const feeCode = joi.string().pattern(new RegExp('shp_.{17}$')).required().messages({
  'string.pattern.base': 'Invalid student fee code',
});

export const getFeeValidator = joi.object().keys({ code: feeCode });

export const getFeesValidator = joi.object().keys({ feeCodes: joi.array().items(feeCode) });
