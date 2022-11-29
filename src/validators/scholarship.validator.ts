import joi from 'joi';

export const createSchorlashipValidator = joi
  .object()
  .keys({
    image: joi.string().optional(),
    user: joi.string().required(),
    title: joi.string().required(),
    description: joi.string().optional(),
    extra_rewards: joi.string().optional(),
    state: joi.valid('published', 'draft').required(),
    frequency: joi.string().valid('weekly', 'monthly', 'quaterly', 'yearly', 'bi-annually').optional(),
    winners: joi.number().integer().optional(),
    organisation: joi.number().integer().optional(),
    application_deadline: joi.date().iso().required(),
    amount: joi.number().integer().min(1).required(),
    currency: joi.string().valid('NGN', 'USD', 'EUR', 'UGX', 'GBP').required(),
    deadline_note: joi.string().required(),
    external_sponsorship: joi.boolean().allow(null),
  })
  .when('.external_sponsorship', {
    is: true,
    then: joi.object({
      minimum_amount: joi.number().integer().min(1).required(),
      accepted_currency: joi.array().items(joi.string().valid('NGN', 'USD', 'EUR', 'UGX', 'GBP')).required(),
    }),
  });
