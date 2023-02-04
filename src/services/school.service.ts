import { IQuestions } from './../database/modelInterfaces';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable array-callback-return */
import { IUser } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { updateIndividual } from '../database/repositories/individual.repo';
import { getOneOrganisationREPO, updateOrganisationREPO } from '../database/repositories/organisation.repo';
import { getSchool, listSchools, updateSchool } from '../database/repositories/schools.repo';
import { sendObjectResponse, BadRequestException, ResourceNotFoundError } from '../utils/errors';
import { theResponse } from '../utils/interface';
import Settings from './settings.service';
import { findOrCreateAddress, findOrCreatePhoneNumber, findSchoolWithOrganization } from './helper.service';
import { answerQuestionnaire, findQuestionnaire } from '../database/repositories/questionnaire.repo';
import { listQuestionnaire } from '../database/repositories/questionTitle.repo';
import { createBusinessValidator } from '../validators/business.validator';
import { getQuestionnaire } from '../validators/schools.validator';
import { mapAnArray, toTitle } from '../utils/utils';
import {
  answerBooleanQuestionsDTO,
  answerDTO,
  answerQuestionsDTO,
  answerQuestionServiceDTO,
  answerQuestionTitlesDTO,
  answerTextQuestionsDTO,
  questionsDTO,
} from '../dto/school.dto';
import { getQuestion } from '../database/repositories/question.repo';
import { boolean } from 'joi';

export const updateSchoolInfo = async (data: any): Promise<theResponse> => {
  //   const validation = createBusinessValidator.validate(data);
  //   if (validation.error) return ResourceNotFoundError(validation.error);

  const { user, schoolName, organisationName, schoolEmail, schoolType, schoolDescription } = data;

  try {
    const existingOrganisation = await getOneOrganisationREPO({ owner: user.id, email: user.email, status: STATUSES.ACTIVE, type: 'school' }, []);
    if (!existingOrganisation) return BadRequestException('Organization not found');

    let foundSchool: { [key: string]: any } = {};
    const schools = await listSchools({ organisation_id: existingOrganisation.id }, []);
    if (!schools.length) return BadRequestException('School not found');

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
    return Promise.all(answers.map(({ question, choice }: answerQuestionServiceDTO) => answerQuestionService({ question, user, choice })));
  } catch (error: any) {
    return BadRequestException(error.message);
  }
};

// todo: answer checkbox questions
// todo: answer radio questions
// todo: answer text questions
// todo: answer questionnaire
