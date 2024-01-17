import joi from 'joi';

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

export const allBusinessAndProductsValidator = joi.object().keys({
  from: joi.string().optional(),
  to: joi.string().optional(),
  search: joi.string().optional(),
  quantity: joi.number().min(1).optional(),
});

export const completeOfficerValidator = joi.object().keys({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  director_username: joi.string().required(),
  organisation_slug: joi.string().required(),
  dob: joi.string().required(),
  nationality: joi.string().required(),
  email: joi.string().email().required(),
  type: joi.string().valid('Director', 'Shareholder').optional(),
  documents: joi.array().items(document).optional(),
  phone_number: joi
    .object({
      countryCode: joi.string().required(),
      localFormat: joi.string().required(),
    })
    .required(),
});
