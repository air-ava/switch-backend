import joi from 'joi';

export const getFeeValidator = joi.object().keys({
  code: joi.string().pattern(new RegExp('shp_.{17}$')).required().messages({
    'string.pattern.base': 'Invalid student fee code',
  }),
});
