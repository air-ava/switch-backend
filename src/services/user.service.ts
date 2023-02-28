import { updateIndividual } from '../database/repositories/individual.repo';
import { findUser, updateUser } from '../database/repositories/user.repo';
import { ResourceNotFoundError, sendObjectResponse, BadRequestException } from '../utils/errors';
import { Sanitizer, sanitizeUser } from '../utils/sanitizer';
import Settings from './settings.service';
import { shopperLoginValidator } from '../validators/auth.validator';
import { findSchoolWithOrganization, findOrCreatePhoneNumber } from './helper.service';
import { createAsset } from './assets.service';
import { IUser } from '../database/modelInterfaces';
import { getOneOrganisationREPO } from '../database/repositories/organisation.repo';
import { getSchool } from '../database/repositories/schools.repo';

export const updateUserProfile = async (data: any): Promise<any> => {
  // const validation = shopperLoginValidator.validate(data);
  // if (validation.error) return ResourceNotFoundError(validation.error);

  const { avatar, firstName, lastName, job_title, email, phone_number: reqPhone, user } = data;
  try {
    const {
      data: { school, organisation },
    } = await findSchoolWithOrganization({ owner: user.id, email: user.email });

    const payload: any = {
      ...(job_title && { job_title: Settings.get('JOB_TITLES')[job_title] }),
    };
    if (reqPhone) {
      const {
        data: { id: phone_number },
      } = await findOrCreatePhoneNumber(reqPhone);
      payload.phone_number = phone_number;
      // payload.phoneNumber = phone_number;
    }

    if (avatar) {
      const createdAsset = await createAsset({
        imagePath: avatar,
        user: user.id,
        trigger: 'update_user_profile',
        organisation: organisation.id,
        entity: 'user',
        entity_id: user.id,
      });
      payload.avatar = createdAsset.data.id;
    }

    await updateIndividual(
      {
        school_id: school.id,
        email: user.email,
      },
      {
        ...payload,
        ...(email && { email }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      },
    );

    await updateUser(
      { id: user.id },
      {
        ...payload,
        ...(firstName && { first_name: firstName }),
        ...(lastName && { last_name: lastName }),
      },
    );

    const userAlreadyExist = await findUser({ id: user.id }, [], ['phoneNumber', 'Address', 'Avatar']);
    if (!userAlreadyExist) throw Error('User not found');

    return sendObjectResponse('User details updated successful', Sanitizer.sanitizeUser(userAlreadyExist));
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};
export const fetchUserProfile = async (data: any): Promise<any> => {
  // const validation = shopperLoginValidator.validate(data);
  // if (validation.error) return ResourceNotFoundError(validation.error);

  const { user } = data;
  try {
    const userAlreadyExist = await findUser({ id: user.id }, [], ['phoneNumber', 'Address', 'Avatar']);
    if (!userAlreadyExist) throw Error('User not found');

    const school = await getSchool({ organisation_id: userAlreadyExist.organisation }, [], ['Organisation']);
    (userAlreadyExist as any).School = school;

    return sendObjectResponse('User details retrieved successful', Sanitizer.sanitizeUser(userAlreadyExist));
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const fetchUserBySlug = async (data: any): Promise<any> => {
  // const validation = shopperLoginValidator.validate(data);
  // if (validation.error) return ResourceNotFoundError(validation.error);

  const { slug } = data;
  try {
    const userAlreadyExist = await findUser({ slug }, [], []);
    if (!userAlreadyExist) throw Error('User not found');

    return sendObjectResponse('User details retrieved successful', Sanitizer.sanitizeUser(userAlreadyExist));
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

// export const fetchUserWithOrganization = async (userId: number): Promise<any> => {
//   // const validation = shopperLoginValidator.validate(data);
//   // if (validation.error) return ResourceNotFoundError(validation.error);

//   try {
//     const user = await findUser({ id: userId }, []);
//     if (!user) throw Error(`User not found`);
//     const organisation = await getOneOrganisationREPO({ id: (user as IUser).organisation }, []);
//     if (organisation) {
//       req.organisation = organisation as any;
//       if (organisation) {
//         const school = await getSchool({ organisation_id: organisation.id }, []);
//         if (school) req.school = school as any;
//       }
//     }

//     return sendObjectResponse('User details retrieved successful', Sanitizer.sanitizeUser(userAlreadyExist));
//   } catch (e: any) {
//     return BadRequestException(e.message);
//   }
// };
