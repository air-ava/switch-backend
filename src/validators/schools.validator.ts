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
