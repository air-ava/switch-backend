import joi from 'joi';

export const gaurdianLoginValidator = joi.object().keys({
  uniqueStudentId: joi.string().max(9).required(),
  parent_username: joi.string().min(8).required(),
  pin: joi.string().length(6).required(),
});
