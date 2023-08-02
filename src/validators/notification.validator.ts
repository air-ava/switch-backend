import joi from 'joi';

export const notificationMethod = joi.string().valid('email', 'phoneNumbers');
export const email = joi.string().email();
export const phoneNumber = joi.string();

export const updateConfig = joi.object().keys({
  notifyInflow: joi.array().items(notificationMethod).optional(),
  notifyOutflow: joi.array().items(notificationMethod).optional(),
  emails: joi.array().items(email).optional(),
  phoneNumbers: joi.array().items(joi.string()).optional(),
});

export const notificationMethods = joi.array().items(notificationMethod).required();
