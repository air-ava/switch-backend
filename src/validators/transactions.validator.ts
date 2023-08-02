import joi from 'joi';

const customDateValidator = (value: any, helpers: any) => {
  if (value.from && value.to && value.from >= value.to) {
    return helpers.message({ custom: '"from" date must be before the "to" date' });
  }
  return value;
};

export const getTransactionsValidator = joi
  .object()
  .keys({
    from: joi.date().iso().optional().messages({
      'date.base': 'Invalid date format for "from". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
      'date.format': 'Invalid date format for "from". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
    }),
    to: joi.date().iso().optional().messages({
      'date.base': 'Invalid date format for "to". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
      'date.format': 'Invalid date format for "to". Should be in ISO format (e.g., "2023-07-18T00:00:00Z").',
    }),
    page: joi.number().integer().min(1).optional().messages({
      'number.base': 'Invalid type for "page". Should be an integer.',
      'number.integer': 'Invalid type for "page". Should be an integer.',
      'number.min': 'The "page" number must be greater than or equal to 1.',
    }),
    userId: joi.string().required(),
    type: joi.string().valid('school-fees', 'fees', 'withdraw').optional().messages({
      'string.base': 'Invalid type for "type". Should be a string.',
      'any.only': 'Invalid value for "type". Must be one of "school-fees", "fees", or "withdraw".',
    }),
    perPage: joi.number().integer().min(1).max(100).optional().messages({
      'number.base': 'Invalid type for "perPage". Should be an integer.',
      'number.integer': 'Invalid type for "perPage". Should be an integer.',
      'number.min': 'The "perPage" value must be greater than or equal to 1.',
      'number.max': 'The "perPage" value must be less than or equal to 100.',
    }),
  })
  .custom(customDateValidator, 'Date validation');
