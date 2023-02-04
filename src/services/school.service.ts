/* eslint-disable array-callback-return */
import { IUser } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { updateIndividual } from '../database/repositories/individual.repo';
import { getOneOrganisationREPO, updateOrganisationREPO } from '../database/repositories/organisation.repo';
import { getSchool, listSchools, updateSchool } from '../database/repositories/schools.repo';
import { sendObjectResponse, BadRequestException } from '../utils/errors';
import { theResponse } from '../utils/interface';
import Settings from './settings.service';
import { findOrCreateAddress, findOrCreatePhoneNumber, findSchoolWithOrganization } from './helper.service';
import { answerQuestionnaire } from '../database/repositories/questions.repo';
import { listQuestionnaire } from '../database/repositories/questionTitle.repo';
import { createBusinessValidator } from '../validators/business.validator';

export const updateSchoolInfo = async (data: any): Promise<theResponse> => {
  //   const validation = createBusinessValidator.validate(data);
  //   if (validation.error) return ResourceNotFoundError(validation.error);

  const { user, schoolName, organisationName, schoolEmail, schoolType, schoolDescription } = data;

  try {
    const existingOrganisation = await getOneOrganisationREPO({ owner: user.id, email: user.email, status: STATUSES.ACTIVE, type: 'school' }, []);
    if (!existingOrganisation) throw Error('Organization not found');

    let foundSchool: { [key: string]: any } = {};
    const schools = await listSchools({ organisation_id: existingOrganisation.id }, []);
    if (!schools.length) throw Error('School not found');

    schools.map((school) => {
      if (schoolName === school.name) foundSchool = school;
    });
    if (!foundSchool) foundSchool = schools[schools.length - 1];

    await updateSchool(
      { id: foundSchool.id },
      {
        name: schoolName,
        email: schoolEmail,
        description: schoolDescription,
        education_level: schoolType,
      },
    );

    await updateOrganisationREPO({ id: existingOrganisation.id }, { name: organisationName });

    return sendObjectResponse('School Information successfully updated');
  } catch (e: any) {
    throw new Error(e.message || 'Updating School Info failed, kindly try again');
  }
};

export const updateSchoolContact = async (data: {
  address: {
    street: string;
    country: string;
    state: string;
    city: string;
    area: string;
  };
  phone_number: {
    localFormat: string;
    countryCode: string;
  };
  user: IUser;
}): Promise<theResponse> => {
  //   const validation = createBusinessValidator.validate(data);
  //   if (validation.error) return ResourceNotFoundError(validation.error);

  const { user, phone_number: reqPhone, address } = data;
  const { country, state } = address;

  try {
    const {
      data: { school: foundSchool },
    } = await findSchoolWithOrganization({ owner: user.id, email: user.email });

    const {
      data: { id: phone_number },
    } = await findOrCreatePhoneNumber(reqPhone);

    const gottenAddress = await findOrCreateAddress({ ...address });

    await updateSchool({ id: foundSchool.id }, { country, state, phone_number, address_id: gottenAddress.data.id });

    return sendObjectResponse('School Contact Information successfully updated');
  } catch (e: any) {
    console.log(e);
    // await queryRunner.rollbackTransaction();
    return BadRequestException('Updating School Contact Information failed, kindly try again');
  } finally {
    // await queryRunner.release();
  }
};

export const updateOrganisationOwner = async (data: {
  firstName: string;
  lastName: string;
  job_title: string;
  email: string;
  phone_number: {
    localFormat: string;
    countryCode: string;
  };
  user: IUser;
}): Promise<theResponse> => {
  //   const validation = createBusinessValidator.validate(data);
  //   if (validation.error) return ResourceNotFoundError(validation.error);

  const { job_title, email, user, phone_number: reqPhone, firstName, lastName } = data;

  try {
    const {
      data: { school: foundSchool },
    } = await findSchoolWithOrganization({ owner: user.id, email: user.email });

    const {
      data: { id: phone_number },
    } = await findOrCreatePhoneNumber(reqPhone);

    await updateIndividual(
      {
        school_id: foundSchool.id,
        email: user.email,
      },
      {
        email,
        firstName,
        lastName,
        phone_number,
        job_title: Settings.get('JOB_TITLES')[job_title],
      },
    );

    return sendObjectResponse('School Owner Information successfully updated');
  } catch (e: any) {
    // await queryRunner.rollbackTransaction();
    return BadRequestException('Updating School Owner Information failed, kindly try again');
  } finally {
    // await queryRunner.release();
  }
};

// export const addUseCaseForYourBusiness = async (data: { user: IUser }): Promise<theResponse> => {
//   //   const validation = createBusinessValidator.validate(data);
//   //   if (validation.error) return ResourceNotFoundError(validation.error);

//   const { user, questions } = data;

//   questions.map(({ titleId, answer }) => {
//     answerQuestionnaire({
//       question_id: titleId,
//       ...(typeof answer === 'string' ? { answer_text: answer } : { answer_boolean: answer }),
//       user_id: user.id,
//     });
//   });

//   try {
//     const {
//       data: { school: foundSchool },
//     } = await findSchoolWithOrganization({ owner: user.id, email: user.email });

//     const {
//       data: { id: phone_number },
//     } = await findOrCreatePhoneNumber(reqPhone);

//     await updateIndividual(
//       {
//         school_id: foundSchool.id,
//         email: user.email,
//       },
//       {
//         email,
//         firstName,
//         lastName,
//         phone_number,
//         job_title: Settings.get('JOB_TITLES')[job_title],
//       },
//     );

//     return sendObjectResponse('School Owner Information successfully updated');
//   } catch (e: any) {
//     // await queryRunner.rollbackTransaction();
//     return BadRequestException('Updating School Owner Information failed, kindly try again');
//   }
// };

export const getQuestions = async ({ process }: { process: string }): Promise<theResponse> => {
    // const validation = createBusinessValidator.validate(data);
  //   if (validation.error) return ResourceNotFoundError(validation.error);

  const response = await listQuestionnaire({ trigger: process }, [], ['Questions']);
  if (!response.length) throw Error('School not found');
  return sendObjectResponse('School Owner Information successfully updated', response);
};
