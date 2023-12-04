import { In, Not } from 'typeorm';
import randomstring from 'randomstring';
import { STATUSES } from '../database/models/status.model';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable array-callback-return */
import { IOrganisation, ISchools, IUser } from '../database/modelInterfaces';
import { findIndividual, listDirectors, saveIndividual, updateIndividual } from '../database/repositories/individual.repo';
import { getOneOrganisationREPO, updateOrganisationREPO } from '../database/repositories/organisation.repo';
import { getSchool, listSchools, updateSchool } from '../database/repositories/schools.repo';
import { sendObjectResponse, BadRequestException, ResourceNotFoundError, NotFoundError, ValidationError, ExistsError } from '../utils/errors';
import { theResponse } from '../utils/interface';
import Settings from './settings.service';
import { findOrCreateAddress, findOrCreatePhoneNumber, findSchoolWithOrganization } from './helper.service';
import { answerQuestionnaire, findQuestionnaire } from '../database/repositories/questionnaire.repo';
import { listQuestionnaire } from '../database/repositories/questionTitle.repo';
import { getQuestionnaire, schoolContact, schoolInfo } from '../validators/schools.validator';
import { toTitle } from '../utils/utils';
import { addOrganisationOfficerDTO, answerBooleanQuestionsDTO, answerQuestionServiceDTO, answerTextQuestionsDTO, updateOrganisationOfficerDTO } from '../dto/school.dto';
import { getQuestion } from '../database/repositories/question.repo';
import { Sanitizer } from '../utils/sanitizer';
import { updateUser } from '../database/repositories/user.repo';
import { createAsset } from './assets.service';
import { getSchoolProduct, listSchoolProduct, saveSchoolProduct } from '../database/repositories/schoolProduct.repo';
import { getProductType, listProductTypes, saveProductType } from '../database/repositories/productType.repo';
import { getSchoolPeriod } from '../database/repositories/schoolPeriod.repo';
import { getClassLevel, listClassLevel } from '../database/repositories/classLevel.repo';
import { getEducationPeriod } from '../database/repositories/education_period.repo';
import { getSchoolClass, listSchoolClass, listSchoolsClassAndFees, saveSchoolClass } from '../database/repositories/schoolClass.repo';
import FeesService from './fees.service';
import { getEducationLevel, listEducationLevel } from '../database/repositories/education_level.repo';
import DocumentService from './document.service';
import { publishMessage } from '../utils/amqpProducer';
import { businessType } from '../database/models/organisation.model';

export const updateSchoolInfo = async (data: any): Promise<theResponse> => {
  const { user, schoolName, organisationName, organisationType, schoolEmail, schoolDescription, schoolWebsite } = data;
  let { schoolType } = data;

  const organisationWithSameName = await getOneOrganisationREPO({ name: organisationName }, ['id', 'name']);
  const existingOrganisation = await getOneOrganisationREPO({ owner: user.id, status: STATUSES.ACTIVE, type: 'school' }, []);
  if (!existingOrganisation) throw new NotFoundError('Organization');
  if (organisationWithSameName && organisationWithSameName.id !== existingOrganisation.id) throw new ExistsError('Organization name');

  const onboarding_reference =
    existingOrganisation.onboarding_reference || `onb_${randomstring.generate({ length: 20, capitalization: 'lowercase', charset: 'alphanumeric' })}`;

  let foundSchool: any;
  const schools = await listSchools({ organisation_id: existingOrganisation.id }, []);
  if (!schools.length) throw new NotFoundError('School');

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
      onboarding_reference,
    },
  );

  await updateOrganisationREPO({ id: existingOrganisation.id }, { name: organisationName, business_type: organisationType, onboarding_reference });

  return sendObjectResponse('School Information successfully updated');
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

  const { phone_number: reqPhone, address } = data;
  const { state } = address;

  const gottenSchool = await findSchoolWithOrganization({ owner: user.id });
  // if (!gottenSchool.success) return gottenSchool;
  const { school: foundSchool } = gottenSchool.data;

  const phoneNumber = await findOrCreatePhoneNumber(reqPhone);
  // if (!phoneNumber.success) return phoneNumber;
  const { id: phone_number } = phoneNumber.data;

  const gottenAddress = await findOrCreateAddress({ ...address, country: foundSchool.country });

  await updateSchool({ id: foundSchool.id }, { state, phone_number, address_id: gottenAddress.data.id });

  return sendObjectResponse('School Contact Information successfully updated');
};

export const updateOrganisationOwner = async (data: {
  firstName: string;
  lastName: string;
  job_title?: string;
  dob?: string;
  nationality?: string;
  email: string;
  type?: string;
  phone_number: {
    localFormat: string;
    countryCode: string;
  };
  user: IUser;
  documents?: any;
  country: 'UGANDA' | 'NIGERIA';
}): Promise<theResponse> => {
  const { nationality, dob, documents, country = 'UGANDA', type, job_title, email, user, phone_number: reqPhone, firstName, lastName } = data;

  const gottenSchool = await findSchoolWithOrganization({ owner: user.id });
  const { school: foundSchool, organisation } = gottenSchool.data;

  const phoneNumber = await findOrCreatePhoneNumber(reqPhone);
  const { id: phone_number } = phoneNumber.data;

  const organisationOwner = await findIndividual({ school_id: foundSchool.id }, []);
  if (!organisationOwner) throw new NotFoundError('Director');

  const document_reference =
    organisationOwner.document_reference || `doc_ref_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
  const onboarding_reference =
    organisation.onboarding_reference || `onb_${randomstring.generate({ length: 20, capitalization: 'lowercase', charset: 'alphanumeric' })}`;

  await updateIndividual(
    { id: organisationOwner.id },
    {
      email,
      firstName,
      lastName,
      phone_number,
      ...(dob && { dob: new Date(dob) }),
      nationality,
      job_title: job_title && Settings.get('JOB_TITLES')[job_title],
      type: type && type.toLowerCase(),
      onboarding_reference,
      document_reference,
    },
  );

  updateUser({ id: user.id }, { phone_number, job_title: job_title && Settings.get('JOB_TITLES')[job_title] });
  if (country === 'NIGERIA') {
    const tag = 'DIRECTOR';
    const process = 'onboarding';
    await DocumentService.addMultipleDocuments({
      documents,
      user,
      tag,
      process,
      country,
      incoming_reference: document_reference,
      verificationData: {
        queue: 'review:customer:submission',
        message: {
          onboarding_reference,
          document_reference,
          tag,
          process,
          school_id: foundSchool.code,
          org_id: organisation.code,
          user_id: organisationOwner.code,
          table_type: 'individual',
        },
      },
    });
  }
  if (!foundSchool.onboarding_reference) await updateSchool({ id: foundSchool.id }, { onboarding_reference });
  if (!organisation.onboarding_reference) await updateOrganisationREPO({ id: organisation.id }, { onboarding_reference });

  return sendObjectResponse('School Owner Information successfully updated');
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
  const { user, session } = data;

  try {
    const gottenSchool = await findSchoolWithOrganization({ owner: user.id });
    if (!gottenSchool.success) return gottenSchool;
    const { school, organisation } = gottenSchool.data;

    const owner = await findIndividual({ school_id: school.id, is_owner: true }, []);
    if (!owner) throw new NotFoundError('Owner');

    const { isAlldocumentsSubmitted, documents } = await DocumentService.areAllRequiredDocumentsSubmitted({
      ...(organisation.business_type && { tag: businessType[organisation.business_type] }),
      process: 'onboarding',
      country: school.country.toUpperCase(),
    });

    return sendObjectResponse(
      'School details retrieved successful',
      Sanitizer.sanitizeSchool({ ...school, session, isAlldocumentsSubmitted, owner }),
    );
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const getPublicSchoolDetails = async (slug: string): Promise<any> => {
  const school = await getSchool({ slug, status: Not(STATUSES.DELETED) }, [], ['phoneNumber', 'Logo', 'Address']);
  if (!school) throw new NotFoundError('School');

  return sendObjectResponse('School retrieved successfully', Sanitizer.sanitizeSchool(school));
};

export const listSchool = async (data: any) => {
  try {
    const foundSchool = await listSchools(
      {},
      [],
      ['Address', 'phoneNumber', 'Organisation', 'Organisation.Owner', 'Logo', 'Organisation.Owner.phoneNumber'],
    );
    return sendObjectResponse('School details retrieved successful', Sanitizer.sanitizeAllArray(foundSchool, Sanitizer.sanitizeSchool));
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const updateSchoolDetails = async (data: any) => {
  const {
    schoolId,
    admin = false,
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
  let { user } = data;
  try {
    let schoolDetails;
    if (!admin) {
      const gottenSchool = await findSchoolWithOrganization({ owner: user.id });
      if (!gottenSchool.success) return gottenSchool;
      // const { school, organisation, country } = gottenSchool.data;
      schoolDetails = gottenSchool.data;
    } else {
      const school = await getSchool(
        { id: schoolId },
        [],
        ['Address', 'phoneNumber', 'Organisation', 'Organisation.Owner', 'Logo', 'Organisation.Owner.phoneNumber'],
      );
      if (!school) throw Error('School not found');
      const { Organisation: organisation, country } = school;
      const owner = (organisation as any).Owner;
      schoolDetails = { school, organisation, country };
      user = owner;
    }
    const { school, organisation, country } = schoolDetails;

    if (organisationName) {
      const organisationWithSameName = await getOneOrganisationREPO({ name: organisationName }, ['id', 'name']);
      if (organisationWithSameName && organisationWithSameName.id !== organisation.id) return BadRequestException('Organization name already Exists');
    }

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

export const backOfficeVerifiesSchool = async (data: any): Promise<theResponse> => {
  // const validation = verifyUserValidator.validate(data);
  // if (validation.error) return ResourceNotFoundError(validation.error);

  const { id } = data;
  try {
    const foundSchool = await getSchool({ id }, [], []);
    if (!foundSchool) throw Error(`School not found`);

    await updateSchool({ id }, { status: STATUSES.VERIFIED });

    return sendObjectResponse('School verified');
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message);
  }
};

const Service = {
  async listClassInSchool(data: any): Promise<theResponse> {
    const { school, ...rest } = data;
    // todo: repo for sum of students and a sum of expected tuition fee
    const response = await listSchoolsClassAndFees({
      school_id: school.id,
      status: Not(STATUSES.DELETED),
      ...rest,
    });
    return sendObjectResponse('All Classes retrieved successfully', response);
  },

  async addClassToSchool(data: any): Promise<theResponse> {
    const { school, code: classCode, authSession } = data;
    const foundClassLevel = await getClassLevel({ code: classCode }, []);
    if (!foundClassLevel) throw new NotFoundError('Class Level');

    const foundSchoolClass = await getSchoolClass({ school_id: school.id, class_id: foundClassLevel.id, status: STATUSES.ACTIVE }, []);
    if (foundSchoolClass) throw new ExistsError(`Class`);

    const schoolClass = await saveSchoolClass({
      school_id: school.id,
      class_id: foundClassLevel.id,
      status: STATUSES.ACTIVE,
    });

    const feesTypes = Settings.get('FEE_TYPES');
    const currencies = Settings.get('COUNTRY_CURRENCIES');
    FeesService.createAFee({
      authSession,
      school,
      class: foundClassLevel.code,
      name: 'Tuition Fee',
      paymentType: 'install-mental',
      feeType: feesTypes.tuition,
      currency: currencies[school.country] || 'UGX',
      amount: 0,
      description: 'Class Default Tuition Fee',
    });
    return sendObjectResponse('Added Class to School Successfully', schoolClass);
  },

  async listClassLevelByEducationLevel(data: any): Promise<theResponse> {
    const { code: educationalCode } = data;
    const educationLevel = await getEducationLevel({ code: educationalCode }, []);
    if (!educationLevel) throw new NotFoundError('Educational Level');

    const foundClassLevel = await listClassLevel({ education_level: educationLevel.name === 'Secondary' ? 'Senior' : educationLevel.name }, []);
    if (!foundClassLevel) throw new NotFoundError('Class Level');

    return sendObjectResponse('Added Class to School Successfully', foundClassLevel);
  },

  async educationLevel(): Promise<theResponse> {
    const educationLevel = await listEducationLevel({}, []);
    return sendObjectResponse('Retrieved Educational Level Successfully', educationLevel);
  },

  async getSchoolAsAdmin(schoolId: any): Promise<theResponse> {
    const schoolCriteria = schoolId.includes('scl_') ? { code: schoolId } : { id: schoolId };
    const school = await getSchool(
      schoolCriteria,
      [],
      ['Address', 'phoneNumber', 'Organisation', 'Organisation.Owner', 'Logo', 'Organisation.Owner.phoneNumber'],
    );
    if (!school) throw Error('School not found');
    const { Organisation: organisation, country } = school;
    const owner = (organisation as any).Owner;
    const schoolDetails = { school, organisation, country };

    return sendObjectResponse('Retrieved School Details Successfully', {
      school,
      user: owner,
      schoolDetails,
    });
  },

  async listSchoolDirectors(data: any): Promise<theResponse> {
    const response = await listDirectors({ school_id: data.school, status: Not(STATUSES.DELETED) }, [], ['phoneNumber', 'Avatar', 'JobTitle']);
    return sendObjectResponse('All Officers retrieved successfully', response);
  },

  async addOrganisationOfficer(data: addOrganisationOfficerDTO): Promise<theResponse> {
    // eslint-disable-next-line prettier/prettier
    const { nationality, dob, school: foundSchool, organisation, documents, country = 'UGANDA', type = 'director', job_title, email, user, phone_number: reqPhone, firstName, lastName } = data;

    const phoneNumber = await findOrCreatePhoneNumber(reqPhone);
    const { id: phone_number } = phoneNumber.data;

    const school_id = foundSchool.id;
    const organisationOwner = await findIndividual({ school_id: foundSchool.id }, []);
    if (!organisationOwner) throw new NotFoundError('organisation owner');
    // eslint-disable-next-line prettier/prettier
    const organisationOfficer = await findIndividual([{ school_id, email }, { school_id, phoneNumber: phone_number }], []);
    if (organisationOfficer) throw new ExistsError('Director');

    const document_reference = `doc_ref_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
    const onboarding_reference =
      organisation.onboarding_reference || `onb_${randomstring.generate({ length: 20, capitalization: 'lowercase', charset: 'alphanumeric' })}`;

    const savedDirector = await saveIndividual({
      email,
      firstName,
      lastName,
      phone_number,
      job_title: job_title && Settings.get('JOB_TITLES')[job_title],
      school_id: foundSchool.id,
      onboarding_reference,
      ...(dob && { dob: new Date(dob) }),
      nationality,
      document_reference,
      type: type && type.toLowerCase(),
    });

    if (country === 'NIGERIA') {
      const tag = 'DIRECTOR';
      const process = 'onboarding';
      await DocumentService.addMultipleDocuments({
        documents,
        user,
        tag,
        process,
        country,
        incoming_reference: document_reference,
        verificationData: {
          queue: 'review:customer:submission',
          message: {
            onboarding_reference,
            document_reference,
            tag,
            process,
            school_id: foundSchool.code,
            org_id: organisation.code,
            user_id: savedDirector.code,
            table_type: 'individual',
          },
        },
      });
    }
    return sendObjectResponse('School Officer Information successfully added');
  },

  async updateOrganisationOfficer(data: updateOrganisationOfficerDTO): Promise<theResponse> {
    const { dob, user, school, officerCode, documents, type = 'director', job_title, email, phone_number: reqPhone, firstName, lastName } = data;

    const organisationOfficer = await findIndividual({ code: officerCode, school_id: school.id, type: Not('guardian') }, []);
    if (!organisationOfficer) throw new NotFoundError('Director');
    if (organisationOfficer.verification_status === STATUSES.VERIFIED) throw new ValidationError('Officer has been verified');
    const updatePayload = { ...organisationOfficer };
    if (reqPhone) {
      const phoneNumber = await findOrCreatePhoneNumber(reqPhone);
      const { id: phone_number } = phoneNumber.data;
      updatePayload.phone_number = phone_number;
    }
    if (type) updatePayload.type = type.toLowerCase();
    if (job_title) updatePayload.job_title = Settings.get('JOB_TITLES')[job_title];
    if (email) updatePayload.email = email;
    if (firstName) updatePayload.firstName = firstName;
    if (lastName) updatePayload.lastName = lastName;
    if (dob) updatePayload.dob = new Date(dob);

    await updateIndividual({ id: organisationOfficer.id }, updatePayload);

    if (documents)
      await DocumentService.addMultipleDocuments({
        documents,
        user,
        tag: 'DIRECTOR',
        process: 'onboarding',
        country: school.country,
        incoming_reference: organisationOfficer.document_reference,
      });
    return sendObjectResponse('School Officer Information successfully updated');
  },
};
export default Service;
