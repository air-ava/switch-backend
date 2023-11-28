import joi from 'joi';

const schoolType = joi
  .string()
  .valid('Nursery', 'Primary', 'Secondary', 'Tertiary', 'Vocational')
  .messages({ 'string.valid.base': 'A wrong school type was selected' });

const orgType = joi.string().valid('sole proprietorship', 'limited liability');
const individualCode = joi.string().pattern(new RegExp('ind_.{17}$')).messages({
  'string.pattern.base': 'Invalid class code, should start with ind_',
});
const country = joi.string().valid('UGANDA', 'NIGERIA');
const document = joi.object({
  requirementType: joi.string().valid('text', 'file', 'number', 'link').required(),
  requirementId: joi.number().required(),
  expiryDate: joi.date().iso().optional().messages({
    'date.base': 'Invalid date format for "expiryDate". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
    'date.format': 'Invalid date format for "expiryDate". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
  }),
  issuingDate: joi.date().iso().optional().messages({
    'date.base': 'Invalid date format for "expiryDate". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
    'date.format': 'Invalid date format for "expiryDate". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
  }),
  document: joi.string().required(),
  type: joi
    .string()
    .valid(
      'POA',
      'BN-NUMBER',
      'RC-NUMBER',
      'TIN',
      'UTILITY',
      'BN-DOC',
      'CAC',
      'CAC-2A',
      'CAC-7A',
      'PASSPORT',
      'DRIVERS_LICENSE',
      'IDENTITY_CARD',
      'VOTER_ID',
    )
    .required(),
});

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

export const schoolOwnerValidator = joi
  .object()
  .keys({
    phone_number: joi
      .object({
        countryCode: joi.string().required(),
        localFormat: joi.string().required(),
      })
      .required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    country: joi
      .string()
      .valid('UGANDA', 'NIGERIA')
      .messages({
        'string.valid.base': 'Steward is not availaible in your country yet',
      })
      .required(),
    email: joi.string().email().required(),
  })
  .when('.country', {
    is: 'UGANDA',
    then: joi.object({
      job_title: joi.string().valid('Director', 'Head Teacher', 'Administrator', 'Teacher', 'Business Person', 'Others').required(),
    }),
  })
  .when('.country', {
    is: 'NIGERIA',
    then: joi.object({
      type: joi.string().valid('Director', 'Shareholder').required(),
      documents: joi.array().items(document).required(),
    }),
  });

export const addSchoolOfficerValidator = joi
  .object()
  .keys({
    phone_number: joi
      .object({
        countryCode: joi.string().required(),
        localFormat: joi.string().required(),
      })
      .required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    country: joi
      .string()
      .valid('UGANDA', 'NIGERIA')
      .messages({
        'string.valid.base': 'Steward is not availaible in your country yet',
      })
      .required(),
    email: joi.string().email().required(),
  })
  .when('.country', {
    is: 'UGANDA',
    then: joi.object({
      job_title: joi.string().valid('Director', 'Head Teacher', 'Administrator', 'Teacher', 'Business Person', 'Others').required(),
    }),
  })
  .when('.country', {
    is: 'NIGERIA',
    then: joi.object({
      type: joi.string().valid('Director', 'Shareholder').required(),
      documents: joi.array().items(document).required(),
    }),
  });

export const updateSchoolOfficerValidator = joi
  .object()
  .keys({
    officerCode: individualCode.required(),
    phone_number: joi
      .object({
        countryCode: joi.string().required(),
        localFormat: joi.string().required(),
      })
      .optional(),
    firstName: joi.string().optional(),
    lastName: joi.string().optional(),
    country: joi
      .string()
      .valid('UGANDA', 'NIGERIA')
      .messages({
        'string.valid.base': 'Steward is not availaible in your country yet',
      })
      .optional(),
    email: joi.string().email().optional(),
  })
  .when('.country', {
    is: 'UGANDA',
    then: joi.object({
      job_title: joi.string().valid('Director', 'Head Teacher', 'Administrator', 'Teacher', 'Business Person', 'Others').optional(),
    }),
  })
  .when('.country', {
    is: 'NIGERIA',
    then: joi.object({
      type: joi.string().valid('Director', 'Shareholder').optional(),
      documents: joi.array().items(document).optional(),
    }),
  });

export const onboardingDocumentValidator = joi.object().keys({
  documents: joi.array().items(document).required(),
  tag: joi.string().valid('SOLE_PROPITOR', 'LIMITED_LIABILITY', 'ADDRESS', 'DIRECTOR').required(),
  process: joi.string().valid('onboarding').required(),
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
