/* eslint-disable max-classes-per-file */
import joi from 'joi';

export const userSchema = joi.object().keys({
  phoneNumber: joi.string().regex(/^234[789][01]\d{8}$/),
  email: joi.string().email(),
  key: joi.string().required(),
  name: joi.string().min(3).message('Name must have more than 3 Characters'),
});
