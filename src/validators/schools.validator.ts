import joi from 'joi';

export const getQuestionnaire = joi.object().keys({
  process: joi.string().valid('onboarding').required(),
  country: joi
    .string()
    .valid('UGANDA')
    .messages({
      'string.valid.base': 'Steward is not availaible in your country yet',
    })
    .optional(),
});

export const schoolContact = joi.object().keys({
  address: joi.object().keys({
    street: joi.string().min(3).required(),
    state: joi.string().min(3).required(),
    city: joi.string().min(3).required(),
    area: joi.string().required(),
  }),
  phone_number: joi.object({
    countryCode: joi.string().required(),
    localFormat: joi.string().required(),
  }),
});

export const addClass = joi.object().keys({
  code: joi.string().pattern(new RegExp('cll_.{17}$')).messages({
    'string.pattern.base': 'Invalid class level code',
  }),
});

export const addClassAdmin = joi.object().keys({
  code: joi.string().pattern(new RegExp('cll_.{17}$')).messages({
    'string.pattern.base': 'Invalid class level code',
  }),
  schoolCode: joi.string().pattern(new RegExp('scl_.{17}$')).messages({
    'string.pattern.base': 'Invalid school code',
  }),
});

export const getClassLevel = joi.object().keys({
  code: joi.string().pattern(new RegExp('edl_.{17}$')).messages({
    'string.pattern.base': 'Invalid educational level code',
  }),
});
