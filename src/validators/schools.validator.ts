import joi from 'joi';

export const getQuestionnaire = joi.object().keys({
  process: joi.string().valid('onboarding').required(),
});
