import { STATUSES } from '../database/models/status.model';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable array-callback-return */
import { IUser } from '../database/modelInterfaces';
import { updateIndividual } from '../database/repositories/individual.repo';
import { getOneOrganisationREPO, updateOrganisationREPO } from '../database/repositories/organisation.repo';
import { getSchool, listSchools, updateSchool } from '../database/repositories/schools.repo';
import { sendObjectResponse, BadRequestException, ResourceNotFoundError } from '../utils/errors';
import { theResponse } from '../utils/interface';
import Settings from './settings.service';
import { findOrCreateAddress, findOrCreatePhoneNumber, findSchoolWithOrganization } from './helper.service';
import { answerQuestionnaire, findQuestionnaire } from '../database/repositories/questionnaire.repo';
import { listQuestionnaire } from '../database/repositories/questionTitle.repo';
import { getQuestionnaire, schoolContact } from '../validators/schools.validator';
import { toTitle } from '../utils/utils';
import { answerBooleanQuestionsDTO, answerQuestionServiceDTO, answerTextQuestionsDTO } from '../dto/school.dto';
import { getQuestion } from '../database/repositories/question.repo';
import { Sanitizer } from '../utils/sanitizer';
import { updateUser } from '../database/repositories/user.repo';
import { createAsset } from './assets.service';

export const updateSchoolInfo = async (data: any): Promise<theResponse> => {
  //   const validation = createBusinessValidator.validate(data);
  //   if (validation.error) return ResourceNotFoundError(validation.error);

  const { user, schoolName, organisationName, schoolEmail, schoolDescription, schoolWebsite } = data;
  let { schoolType } = data;

  try {
    const organisationWithSameName = await getOneOrganisationREPO({ name: organisationName }, ['id', 'name']);
    const existingOrganisation = await getOneOrganisationREPO({ owner: user.id, email: user.email, status: STATUSES.ACTIVE, type: 'school' }, []);
    if (!existingOrganisation) return BadRequestException('Organization not found');
    if (organisationWithSameName && organisationWithSameName.id !== existingOrganisation.id) return BadRequestException('Organization name already Exists');

    let foundSchool: any;
    const schools = await listSchools({ organisation_id: existingOrganisation.id }, []);
    if (!schools.length) return BadRequestException('School not found');

    schools.map((school) => {
      if (schoolName === school.name) foundSchool = school;
    });
    if (!foundSchool) foundSchool = schools[schools.length - 1];

    if (Array.isArray(schoolType)) schoolType = schoolType.join(',');

    await updateSchool(
      { id: foundSchool.id },
      {
        name: schoolName,
        email: schoolEmail,
        description: schoolDescription,
        education_level: schoolType,
        website: schoolWebsite,
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
  const { user, ...rest } = data;

  const validation = schoolContact.validate(rest);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { phone_number: reqPhone, address } = data;
  const { state } = address;

  try {
    const gottenSchool = await findSchoolWithOrganization({ owner: user.id, email: user.email });
    if (!gottenSchool.success) return gottenSchool;
    const { school: foundSchool } = gottenSchool.data;

    const phoneNumber = await findOrCreatePhoneNumber(reqPhone);
    if (!phoneNumber.success) return phoneNumber;
    const { id: phone_number } = phoneNumber.data;

    const gottenAddress = await findOrCreateAddress({ ...address, country: foundSchool.country });

    await updateSchool({ id: foundSchool.id }, { state, phone_number, address_id: gottenAddress.data.id });

    return sendObjectResponse('School Contact Information successfully updated');
  } catch (e: any) {
    // await queryRunner.rollbackTransaction();
    return BadRequestException(e || 'Updating School Contact Information failed, kindly try again');
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
    const gottenSchool = await findSchoolWithOrganization({ owner: user.id, email: user.email });
    if (!gottenSchool.success) return gottenSchool;
    const { school: foundSchool } = gottenSchool.data;

    const phoneNumber = await findOrCreatePhoneNumber(reqPhone);
    if (!phoneNumber.success) return phoneNumber;
    const { id: phone_number } = phoneNumber.data;

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
        job_title: Settings.get('JOB_TITLES')[job_title] || undefined,
      },
    );

    updateUser({ id: user.id }, { phone_number, job_title: Settings.get('JOB_TITLES')[job_title] ? job_title : undefined });

    return sendObjectResponse('School Owner Information successfully updated');
  } catch (e: any) {
    // await queryRunner.rollbackTransaction();
    return BadRequestException('Updating School Owner Information failed, kindly try again');
  } finally {
    // await queryRunner.release();
  }
};

export const getQuestions = async ({ process }: { process: string }): Promise<theResponse> => {
  const validation = getQuestionnaire.validate({ process });
  if (validation.error) return ResourceNotFoundError(validation.error);

  const response = await listQuestionnaire({ trigger: process }, [], ['Questions']);
  if (!response.length) return BadRequestException('School not found');
  return sendObjectResponse(`${toTitle(process)} questionnaire retrieved successfully'`, response);
};

export const answerBooleanQuestions = async ({ question, answer, user }: answerBooleanQuestionsDTO): Promise<theResponse> => {
  try {
    const questionToAnswer = await findQuestionnaire({ question_id: question, user_id: user }, [], ['Question']);
    if (questionToAnswer) return BadRequestException(`The Question option [${questionToAnswer.Question.question}] answered already`);

    await answerQuestionnaire({ question_id: question, user_id: user, answer_boolean: answer });
    return sendObjectResponse('Question answered successfully');
  } catch (error: any) {
    return BadRequestException(error.message);
  }
};

export const answerTextQuestions = async ({ question, answer, user }: answerTextQuestionsDTO): Promise<theResponse> => {
  try {
    const questionToAnswer = await findQuestionnaire({ question_id: question, user_id: user }, [], ['Question']);
    if (questionToAnswer) return BadRequestException(`The Question option [${questionToAnswer.Question.question}] answered already`);

    await answerQuestionnaire({ question_id: question, user_id: user, answer_text: answer });
    return sendObjectResponse('Question answered successfully');
  } catch (error: any) {
    return BadRequestException(error.message);
  }
};

export const answerQuestionService = async ({ question, user, choice }: answerQuestionServiceDTO & { user: string }): Promise<theResponse> => {
  try {
    const questionToAnswer = await getQuestion({ id: question }, []);
    if (!questionToAnswer) return BadRequestException('Questions not found');

    const checkForUseCaseAnswer = (questionToAnswer.type === 'checkbox' || questionToAnswer.type === 'radio') && typeof choice === 'boolean';
    if (!checkForUseCaseAnswer) return BadRequestException('Answer has to be boolean');
    return answerBooleanQuestions({ question, answer: choice, user });
  } catch (error: any) {
    return BadRequestException(error.message);
  }
};

export const answerQuestionnaireService = async ({ answers, user }: { answers: answerQuestionServiceDTO[]; user: string }): Promise<any> => {
  try {
    const gottenSchool = await findSchoolWithOrganization({ owner: user });
    if (!gottenSchool.success) return gottenSchool;
    const { school } = gottenSchool.data;

    await Promise.all(answers.map(({ question, choice }: answerQuestionServiceDTO) => answerQuestionService({ question, user, choice })));

    await updateSchool({ id: school.id }, { status: STATUSES.VERIFIED });
    return sendObjectResponse('Onboarding completed successfully');
  } catch (error: any) {
    return BadRequestException(error.message);
  }
};

export const getSchoolDetails = async (data: any) => {
  const { user } = data;

  try {
    const gottenSchool = await findSchoolWithOrganization({ owner: user.id, email: user.email });
    if (!gottenSchool.success) return gottenSchool;
    const { school } = gottenSchool.data;

    return sendObjectResponse('School details retrieved successful', Sanitizer.sanitizeSchool(school));
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const updateSchoolDetails = async (data: any) => {
  const {
    user,
    logo,
    phone_number: reqPhone,
    address,
    schoolName,
    schoolWebsite,
    organisationName,
    schoolEmail,
    schoolType,
    schoolDescription,
  } = data;
  try {
    const gottenSchool = await findSchoolWithOrganization({ owner: user.id, email: user.email });
    if (!gottenSchool.success) return gottenSchool;
    const { school, organisation, country } = gottenSchool.data;

    if (school.status === STATUSES.UNVERIFIED) throw Error('School not verified');

    const payload: any = {};
    if (reqPhone) {
      const phoneNumber = await findOrCreatePhoneNumber(reqPhone);
      if (!phoneNumber.success) return phoneNumber;
      const { id: phone_number } = phoneNumber.data;
      payload.phone_number = phone_number;
    }

    if (address) {
      const gottenAddress = await findOrCreateAddress({ ...address, country });
      payload.state = address.state;
      payload.address_id = gottenAddress.data.id;
    }

    if (logo) {
      const createdAsset = await createAsset({
        imagePath: logo,
        user: user.id,
        trigger: 'update_school_details',
        organisation: organisation.id,
        entity: 'school',
        entity_id: school.id,
      });
      payload.logo = createdAsset.data.id;
    }

    if (organisationName) await updateOrganisationREPO({ id: organisation.id }, { name: organisationName });
    await updateSchool(
      { id: school.id },
      {
        ...(schoolName && { name: schoolName }),
        ...(schoolEmail && { email: schoolEmail }),
        ...(schoolDescription && { description: schoolDescription }),
        ...(schoolWebsite && { website: schoolWebsite }),
        ...(schoolType && { education_level: schoolType.toString() }),
        ...payload,
      },
    );

    const foundSchool = await getSchool({ id: school.id }, [], ['Address', 'phoneNumber', 'Organisation', 'Organisation.Owner']);
    if (!foundSchool) throw Error('School not found');

    return sendObjectResponse('School update completed successfully', Sanitizer.sanitizeSchool(foundSchool));
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};
