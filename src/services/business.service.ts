import { findUser, createAUser } from '../database/repositories/user.repo';
import { createUserDTO } from '../dto/user.dto';
import { ResourceNotFoundError, BadRequestException, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { registerValidator } from '../validators/auth.validator';

export const createBusiness = async (data: createUserDTO): Promise<theResponse> => {
  console.log({
    data,
  });

  const validation = registerValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { is_business = false, email, phone_number, password, ...rest } = data;

  try {
    const userAlreadyExist = await findUser([{ email }, { phone_number }], []);
    if (userAlreadyExist) return BadRequestException('Account already exists');

    // await createAUser({
    //   email,
    //   ...rest,
    //   phone_number: phone_number.replace('+', ''),
    //   password: `bcrypt.hashSync(password, 8)`,
    //   is_business,
    // });

    return sendObjectResponse('Account created successfully');
  } catch (e: any) {
    return BadRequestException('Account creation failed, kindly try again');
  }
};
