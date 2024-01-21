import joi from 'joi';

export const gaurdianLoginValidator = joi.object().keys({
  uniqueStudentId: joi.string().min(9).max(10).required(),
  parent_username: joi.string().min(8).required(),
  pin: joi.string().length(6).required(),
});
