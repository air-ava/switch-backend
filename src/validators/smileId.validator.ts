import joi from 'joi';

const image = joi.object({
  is_image_base64: joi.boolean().optional().default(false),
  image_type: joi.string().valid('ID', 'LIVE', 'SELFIE').optional().default('ID'),
  image_face: joi.string().valid('FRONT', 'BACK').optional().default('FRONT'),
  image: joi.string().uri().required(),
});

const Validator = {
  basicKyc: joi
    .object({
      first_name: joi.string().max(30).required(),
      last_name: joi.string().required(),
      id_type: joi.string().valid('BVN', 'NIN', 'NIN_SLIP', 'DRIVERS_LICENSE', 'PHONE_NUMBER', 'VOTER_ID', 'BANK_ACCOUNT').required(),
      id_number: joi
        .string()
        .when('id_type', {
          is: 'DRIVERS_LICENSE',
          then: joi
            .string()
            .pattern(/^[a-zA-Z]{3}([ -]{1})?[A-Z0-9]{6,12}$/i)
            .required(),
        })
        .when('id_type', {
          is: 'VOTER_ID',
          then: joi
            .string()
            .pattern(/^[a-zA-Z0-9 ]{9,20}$/i)
            .required(),
        })
        .when('id_type', {
          is: 'PHONE_NUMBER',
          then: joi
            .string()
            .pattern(/^[0-9]{11}$/)
            .required(),
        })
        .required(),
      partner_params: joi
        .object({
          table_code: joi.string().required(),
          table_id: joi.string().required(),
          table_type: joi.string().valid('business', 'user', 'individual').required(),
        })
        .required(),
      gender: joi.string().max(30).optional(),
    })
    .when('.id_type', {
      is: 'DRIVERS_LICENSE',
      then: joi
        .object({
          phone_number: joi
            .string()
            .length(11)
            .pattern(/^[0-9]{11}$/)
            .required(),
          dob: joi
            .string()
            .max(15)
            .pattern(/^[0-9]+$/)
            .required(),
        })
        .required(),
    }),

  businessKyc: joi.object({
    id_type: joi.string().valid('TIN', 'CAC').required(),
    id_number: joi
      .string()
      .when('id_type', {
        is: 'CAC',
        then: joi.string(),
      })
      .required(),
    // company: joi.string().when('id_type', {
    //   is: 'CAC',
    //   then: joi.string().required(),
    //   otherwise: joi.string().optional(),
    // }),
    partner_params: joi
      .object({
        // table_code: joi.string().required(),
        table_id: joi.string().required(),
        table_type: joi.string().valid('business', 'user', 'individual').required(),
      })
      .required(),
  }),

  documentVerification: joi.object({
    id_type: joi.string().valid('PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID', 'VOTER_ID').required(),
    // image_selfie: joi.string().uri().optional(),
    image_details: joi.array().items(image).required(),
    partner_params: joi
      .object({
        table_code: joi.string().required(),
        table_id: joi.string().required(),
        table_type: joi.string().valid('business', 'user', 'individual').required(),
      })
      .required(),
  }),
};

export default Validator;
