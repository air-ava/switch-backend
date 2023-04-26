// import * as bcrypt from 'bcrypt';
// import randomstring from 'randomstring';
// import { theResponse } from '../utils/interface';
// import BackOfficeUserRepo from '../database/repositories/backOfficeUser.repo';
// import { IBackOfficeUsers } from '../database/modelInterfaces';
// import { STATUSES } from '../database/models/status.model';
// import { sendObjectResponse, BadRequestException } from '../utils/errors';
// import { generateBackOfficeToken } from '../utils/jwt';
// import { Sanitizer } from '../utils/sanitizer';
// import { sendEmail } from '../utils/mailtrap';
// import { updatePhoneNumber } from '../database/repositories/phoneNumber.repo';

// const Service = {
//   async backOfficeVerifyPhoneNumber(data: any): Promise<any> {
//     // const validation = verifyUserValidator.validate(data);
//     // if (validation.error) return ResourceNotFoundError(validation.error);

//     const { id, token: remember_token } = data;
//     try {
//       const userAlreadyExist = id
//         ? await BackOfficeUserRepo.findBackOfficeUser({ id }, [], [])
//         : await BackOfficeUserRepo.findBackOfficeUser({ remember_token }, [], []);

//       if (!userAlreadyExist) throw Error(`User Not Found`);
//       if (userAlreadyExist.remember_token !== remember_token) throw Error(`Wrong Token`);

//       await updatePhoneNumber({ id }, { email_verified_at: new Date(Date.now()) });

//       const token = generateBackOfficeToken(userAlreadyExist);
//       return sendObjectResponse('Admin verified', { token });
//     } catch (e: any) {
//       console.log({ e });
//       return BadRequestException(e.message);
//     }
//   },
// };

// export default Service;
