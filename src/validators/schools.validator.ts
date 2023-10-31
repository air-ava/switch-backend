import joi from 'joi';

const schoolType = joi
  .string()
  .valid('Nursery', 'Primary', 'Secondary', 'Tertiary', 'Vocational')
  .messages({ 'string.valid.base': 'A wrong school type was selected' });

const orgType = joi.string().valid('sole proprietorship', 'limited liability');
const country = joi.string().valid('UGANDA', 'NIGERIA');

export const getQuestionnaire = joi.object().keys({
  process: joi.string().valid('onboarding').required(),
  tag: joi.string().valid('ADDRESS', 'SOLE_PROPITOR', 'LIMITED_LIABILITY', 'DIRECTOR').optional(),
  country: joi
    .string()
    .valid('UGANDA', 'NIGERIA')
    .messages({
      'string.valid.base': 'Steward is not availaible in your country yet',
    })
    .required(),
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

export const schoolInfo = joi
  .object()
  .keys({
    schoolType: joi.array().items(schoolType).required(),
    schoolWebsite: joi.string().optional(),
    schoolDescription: joi.string().required(),
    schoolName: joi.string().required(),
    organisationName: joi.string().required(),
    organisationType: orgType.required(),
    country: country.required(),
  })
  .when('.country', {
    is: 'UGANDA',
    then: joi.object({
      schoolEmail: joi.string().email().optional(),
    }),
  })
  .when('.country', {
    is: 'NIGERIA',
    then: joi.object({
      schoolEmail: joi.string().email().required(),
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
