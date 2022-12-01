import * as bcrypt from 'bcrypt';
import { log } from 'winston';
import randomstring from 'randomstring';
import { findMultipleScholarships, findScholarship, findScholarships, saveScholarshipREPO } from '../database/repositories/scholarship.repo';
import { findScholarshipEligibility, saveScholarshipEligibilityREPO } from '../database/repositories/scholarshipEligibility.repo';
import { findUser, saveAUser } from '../database/repositories/user.repo';
import { sendObjectResponse, BadRequestException, ResourceNotFoundError } from '../utils/errors';
import { Log } from '../utils/logs';
import { createAsset } from './assets.service';
import { findOrCreateAddress, findOrCreatePhoneNumber } from './helper.service';
import { saveSponsorshipsREPO } from '../database/repositories/sponsorship.repo';
import { saveSponsorshipConditionsREPO } from '../database/repositories/sponsorshipConditions.repo';
import { createSchorlashipValidator } from '../validators/scholarship.validator';
import { saveSchoolsREPO } from '../database/repositories/schools.repo';
import { saveScholarshipRequirementREPO } from '../database/repositories/scholarshipRequirement.repo';
import { response } from 'express';
import { saveScholarshipApplicationREPO } from '../database/repositories/scholarshipApplication.repo';
import { saveSocialREPO } from '../database/repositories/social.repo';
import { IUser } from '../database/modelInterfaces';
import { saveLinkREPO } from '../database/repositories/link.repo';

export const createSchorlaship = async (data: {
  image: string;
  title: string;
  description: string;
  amount: number;
  frequency: string;
  state: string;
  other_rewards: string;
  winners: number;
  application_deadline: Date;
  currency: string;
  user: string;
  deadline_note: string;
  organisation: number;
  external_sponsorship?: boolean;
  minimum_amount: number;
  accepted_currency: string[];
}): Promise<any> => {
  const validation = createSchorlashipValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { image, user, title, organisation, external_sponsorship = false, minimum_amount, accepted_currency, ...rest } = data;

  const existingScholarship = await findScholarship({ title, user_id: user, ...(organisation && { org_id: organisation }) }, []);
  if (existingScholarship) throw Error('Sorry, Scholarship already exists');

  const { success, data: asset } = await createAsset({ imagePath: image, user });
  if (!success) throw Error('Error creating asset');

  const {
    id: scholarship_id,
    amount,
    currency,
    ...response
  } = await saveScholarshipREPO({
    image,
    image_id: asset.id,
    user_id: user,
    org_id: organisation,
    title,
    ...(external_sponsorship && { external_sponsorship }),
    ...rest,
  });

  if (external_sponsorship) {
    await Promise.all(accepted_currency.map((item: string) => saveSponsorshipConditionsREPO({ scholarship_id, currency: item, minimum_amount })));
  }

  return sendObjectResponse('Business created successfully', {
    amount: amount.toLocaleString('en-US', {
      style: 'currency',
      currency,
    }),
    id: scholarship_id,
    ...response,
  });
};

export const createSchorlashipEligibility = async (data: {
  scholarship_id: string;
  applicant_description: string;
  submission_requirements: ('essay' | 'link' | 'file' | 'images')[];
  essay_requirements: string;
  education_level: string;
  // link_requirements: { name: string; url: string }[];
  // file_requirements: { name: string; url: string }[];
  link_requirements: string[];
  file_requirements: string[];
  image_requirements: string;
  specific_schools: boolean;
  eligible_schools: {
    country: string;
    state: string;
    level: string;
    name: string;
  };
  userId: string;
  organisation?: number;
}): Promise<any> => {
  // todo: validation for this functions
  // const validation = createBusinessValidator.validate(data);
  // if (validation.error) return ResourceNotFoundError(validation.error);

  const {
    organisation,
    eligible_schools,
    scholarship_id,
    submission_requirements,
    link_requirements,
    file_requirements,
    specific_schools = false,
    userId,
    ...rest
  } = data;

  const existingScholarship = await findScholarship({ id: scholarship_id }, []);
  if (!existingScholarship) throw Error('Sorry, Scholarship does not exist');

  const existingEligibility = await findScholarshipEligibility({ scholarship_id }, []);
  if (existingEligibility) throw Error('Sorry, Scholarship Eligibility already field');

  // ? Below is used to add assets and links
  const link_reference = randomstring.generate({ length: 5, capitalization: 'lowercase', charset: 'alphanumeric' });
  const file_reference = randomstring.generate({ length: 5, capitalization: 'lowercase', charset: 'alphanumeric' });

  // await Promise.all(
  //   file_requirements.map(({ name, url }) =>
  //     createAsset({ imagePath: url, user: userId, trigger: 'scholarship_eligibility', organisation, name, reference: asset_reference }),
  //   ),
  // );
  await Promise.all(
    link_requirements.map((item: string) => saveScholarshipRequirementREPO({ name: item, requirement_type: 'link', reference: link_reference })),
  );
  await Promise.all(
    file_requirements.map((item: string) => saveScholarshipRequirementREPO({ name: item, requirement_type: 'file', reference: file_reference })),
  );

  let school;
  if (specific_schools) {
    const { country, state, level, name } = eligible_schools;
    school = await saveSchoolsREPO({
      country,
      state,
      education_level: level,
      name,
    });
  }

  const response = await saveScholarshipEligibilityREPO({
    scholarship_id,
    submission_requirements: submission_requirements.toString(),
    link_requirements: link_reference,
    file_requirements: file_reference,
    specific_schools,
    ...(school && { eligible_school: school.id }),
    ...rest,
  });

  return sendObjectResponse('Scholarship Eligibility created successfully', response);
};

export const addSponsors = async (data: {
  scholarship_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: {
    localFormat: string;
    countryCode: string;
  };
  frequency: 'weekly' | 'monthly' | 'quaterly' | 'yearly' | 'bi-annually';
  payment_type: 'one_time' | 'recurring';
  anonymous: boolean;
  take_transaction_charge: boolean;
  amount: number;
  currency: string;
  organisation?: number;
}): Promise<any> => {
  const {
    payment_type,
    anonymous = false,
    take_transaction_charge = true,
    scholarship_id,
    email,
    phone_number: reqPhone,
    frequency,
    amount,
    currency,
    organisation,
    ...rest
  } = data;

  const existingScholarship = await findScholarship({ id: scholarship_id }, []);
  if (!existingScholarship) throw Error('Sorry, Scholarship does not exist');

  let userAlreadyExist = await findUser({ email }, []);
  if (!userAlreadyExist) {
    const {
      data: { id: phone_number },
    } = await findOrCreatePhoneNumber(reqPhone);

    const { countryCode: code, localFormat: phone } = reqPhone;
    const passwordHash = bcrypt.hashSync(email, 8);

    userAlreadyExist = await saveAUser({ email, phone_number, code, phone, user_type: 'sponsor', ...rest, password: passwordHash });
  }

  const response = await saveSponsorshipsREPO({
    frequency,
    minimum_amount: amount,
    currency,
    user: userAlreadyExist.id,
    scholarship_id,
    take_transaction_charge,
    ...(organisation && { organisation }),
    anonymous,
    payment_type,
    fees_paid_by: 'donor',
  });
  // todo: send email to the sponsor and organization
  return sendObjectResponse('Scholarship Sponsorship created successfully', response);
};

export const scholarshipApplication = async (data: {
  scholarship_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: {
    localFormat: string;
    countryCode: string;
  };
  education_level: string;
  address: {
    street: string;
    country: string;
    state: string;
    city: string;
    area: string;
  };
  socials: { type: string; url: string }[];
  requirements: {
    essay: string;
    links: { link_criteria_id: string; url: string }[];
    files: { file_criteria_id: string; url: string }[];
  };
}): Promise<any> => {
  const { education_level, socials, requirements, address, scholarship_id, email, phone_number: reqPhone, ...rest } = data;
  const { essay, links, files } = requirements;

  const existingScholarship = await findScholarship({ id: scholarship_id }, []);
  if (!existingScholarship) throw Error('Sorry, Scholarship does not exist');

  const organisation = existingScholarship.org_id;

  let userAlreadyExist = await findUser({ email }, [], ['phoneNumber', 'Address']);
  if (!userAlreadyExist) {
    const passwordHash = bcrypt.hashSync(email, 8);

    userAlreadyExist = await saveAUser({ email, user_type: 'scholar', ...rest, password: passwordHash });
  }
  // check if scholarship has bee applied to by scholar
  const {
    data: { id: phone_number },
  } = await findOrCreatePhoneNumber(reqPhone);


  if (userAlreadyExist && !userAlreadyExist.phoneNumber) {
    const { countryCode: code, localFormat: phone } = reqPhone;
    userAlreadyExist = await saveAUser({ id: userAlreadyExist.id, phone_number, code, phone });
  }

  const gottenAddress = await findOrCreateAddress({ ...address });
  await Promise.all(socials.map(({ type, url }) => saveSocialREPO({ type, link: url, user_id: (userAlreadyExist as IUser).id })));

  if (userAlreadyExist && !userAlreadyExist.Address) {
    userAlreadyExist = await saveAUser({ id: userAlreadyExist.id, address_id: gottenAddress.data.id });
  }

  const application = await saveScholarshipApplicationREPO({
    user: (userAlreadyExist as IUser).id,
    scholarship_id,
    phone: phone_number,
    essay,
    education_level,
    address_id: gottenAddress.data.id,
  });

  await Promise.all(
    files.map(({ file_criteria_id, url }) =>
      createAsset({
        imagePath: url,
        user: (userAlreadyExist as IUser).id,
        trigger: 'scholarship_applications',
        organisation,
        reference: application.id,
        entity: 'scholarship_requirement',
        entity_id: file_criteria_id,
      }),
    ),
  );

  await Promise.all(
    links.map(({ link_criteria_id, url }) =>
      saveLinkREPO({
        link: url,
        trigger: 'scholarship_applications',
        organisation,
        reference: application.id,
        user: (userAlreadyExist as IUser).id,
        entity: 'scholarship_requirement',
        entity_id: link_criteria_id,
      }),
    ),
  );

  // application = saveScholarshipApplicationREPO({ id: application.id, });
  // todo: send email to the sponsor and organization
  return sendObjectResponse('Scholarship Sponsorship created successfully', application);
};

export const getScholarships = async (): Promise<any> => {
  try {
    const existingCompany = await findMultipleScholarships(
      {},
      [],
      [
        'Status',
        'Currency',
        'Eligibility',
        'Eligibility.linkRequirements',
        'Eligibility.fileRequirements',
        'User',
        'Sponsorships.User',
        'Sponsorships',
        'Applications',
      ],
    );
    if (!existingCompany.length) throw Error('Sorry, no business has been created');

    return sendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    log(Log.fg.red, e);
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};

export const getCompanyScholarships = async (user_id: string, org_id: number): Promise<any> => {
  try {
    const existingCompany = await findMultipleScholarships(
      { user_id, org_id },
      [],
      ['Status', 'Currency', 'Eligibility', 'Eligibility.Requirements', 'User', 'Sponsorships.User', 'Sponsorships', 'Applications'],
    );
    if (!existingCompany.length) throw Error('Sorry, no business has been created');

    return sendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    log(Log.fg.red, e);
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};

export const getScholarship = async (code: string): Promise<any> => {
  try {
    const existingCompany = await findScholarship(
      { id: code },
      [],
      ['Status', 'Currency', 'Eligibility', 'Eligibility.Requirements', 'User', 'Sponsorships.User', 'Sponsorships', 'Applications'],
    );
    if (!existingCompany) throw Error('Sorry, no business has been created');

    return sendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    // log(Log.fg.red, e);
    console.log({ e });
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};
