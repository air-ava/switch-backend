import * as bcrypt from 'bcrypt';

import { theResponse } from '../utils/interface';
import { userSchema } from '../authSchema/user';
import { BadRequestError, ResourceNotFoundError } from '../utils/errors';

export const createRole = async (data: { phoneNumber: string; email: string; key: string; name: string }): Promise<theResponse> => {
  const validation = userSchema.validate(data);
  if (validation.error) {
    return ResourceNotFoundError(validation.error);
  }

  const hash_api_key = bcrypt.hashSync(data.key, 8);
  if (!bcrypt.compareSync(data.key, hash_api_key)) return BadRequestError('Wrong credentials');
  return {
    success: true,
    message: 'Test successful',
  };
};
