import { findUser } from '../database/repositories/user.repo';
import { ResourceNotFoundError, sendObjectResponse, BadRequestException } from '../utils/errors';
import { sanitizeUser } from '../utils/sanitizer';
import { shopperLoginValidator } from '../validators/auth.validator';

export const userProfile = async (data: any): Promise<any> => {
  const validation = shopperLoginValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { id } = data;
  try {
    const userAlreadyExist = await findUser({ id }, [], ['phoneNumber']);
    if (!userAlreadyExist) throw Error(`User does not exist`);

    return sendObjectResponse('User details retrieved successful', sanitizeUser(userAlreadyExist));
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};
