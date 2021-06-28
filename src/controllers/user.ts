import { Response } from '../utils/interface';
import { userSchema } from '../authSchema/user';
import { ResourceNotFoundError } from '../utils/errors';

/* eslint-disable no-console */
export const createRole = async (data: { phoneNumber: string; email: string; key: string; name: string }): Promise<Response> => {
  const validation = userSchema.validate(data);
  if (validation.error) {
    return ResourceNotFoundError(validation.error);
  }
  return {
    success: true,
    message: 'Role created successful',
  };
};
