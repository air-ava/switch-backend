import joiDate from '@joi/date';
import Joi from 'joi';

const joi = Joi.extend(joiDate);

export const initiateCardChargeToSaveSCHEMA = {
  userMobile: joi
    .string()
    .regex(/^234[789][01]\d{8}$/)
    .required(),
  cardNumber: joi.string().required(),
  cvv: joi.string().required(),
  expiryMonth: joi
    .string()
    .regex(/^\d{2}$/)
    .required(),
  expiryYear: joi
    .string()
    .regex(/^\d{2}$/)
    .required(),
  amount: joi.number().min(100).integer().message('Amount must be greater than NGN 1').required(),
  email: joi.string().email().required(),
  name: joi.string().required(),
  redirectUrl: joi.string(),
  pin: joi.string().regex(/^\d{4}$/),
  reference: joi.string(),
  type: joi.string().required().valid('user', 'business'),
  currency: joi.string().required().length(3),
};

export const validateCardChargeSCHEMA = {
  reference: joi.string().required(),
  otp: joi.string().required(),
};

export const chargeSavedCardForFundingSCHEMA = {
  user_id: joi.string().required(),
  userEmail: joi.string().email().required(),
  amount: joi.number().integer().min(100).message('Amount must be at least NGN 1').required(),
  cardId: joi.number().integer().min(1).message('Invalid card ID').required(),
  transactionPin: joi
    .string()
    .regex(/^\d{5}$/)
    .message('Invalid transaction PIN'),
  type: joi.string().required().valid('user', 'business'),
  currency: joi.string().required().length(3),
};

export const verifyChargeFromWebhookSCHEMA = {
  transactionId: joi.string().required(),
  user_id: joi.string().required(),
};
