import randomstring from 'randomstring';
import * as bcrypt from 'bcrypt';
import { log } from 'winston';
import { saveLinkREPO } from '../database/repositories/link.repo';
import { findMultipleScholarships, findScholarship, saveScholarshipREPO } from '../database/repositories/scholarship.repo';
import { findScholarshipEligibility, saveScholarshipEligibilityREPO } from '../database/repositories/scholarshipEligibility.repo';
import { createAUser, findUser, saveAUser } from '../database/repositories/user.repo';
import { sendObjectResponse, oldSendObjectResponse, BadRequestException } from '../utils/errors';
import { Log } from '../utils/logs';
import { createAsset } from './assets.service';
import { findOrCreatePhoneNumber } from './helper.service';
import { saveSponsorshipsREPO } from '../database/repositories/sponsorship.repo';

export const createSchorlaship = async (data: {
  image: string;
  title: string;
  description: string;
  amount: number;
  frequency: string;
  state: string;
  winners: number;
  application_deadline: Date;
  currency: string;
  user: string;
  deadline_note: string;
  organisation: number;
}): Promise<any> => {
  // const validation = createBusinessValidator.validate(data);
  // if (validation.error) return ResourceNotFoundError(validation.error);

  const { image, user, title, organisation, ...rest } = data;

  const existingScholarship = await findScholarship({ title, user_id: user, ...(organisation && { org_id: organisation }) }, []);
  if (existingScholarship) throw Error('Sorry, Scholarship already exists');

  const { success, data: asset } = await createAsset({ imagePath: image, user });

  if (!success) throw Error('Error creating asset');

  const { amount, currency, ...response } = await saveScholarshipREPO({
    image,
    image_id: asset.id,
    user_id: user,
    org_id: organisation,
    title,
    ...rest,
  });

  return sendObjectResponse('Business created successfully', {
    amount: amount.toLocaleString('en-US', {
      style: 'currency',
      currency,
    }),
    ...response,
  });
};

export const createSchorlashipEligibility = async (data: {
  scholarship_id: string;
  applicant_description: string;
  submission_requirements: ('essay' | 'link' | 'file' | 'images')[];
  essay_requirements: string;
  link_requirements: { name: string; url: string }[];
  file_requirements: { name: string; url: string }[];
  image_requirements: string;
  specific_schools: boolean;
  eligible_schools: string;
  userId: string;
  organisation?: number;
}): Promise<any> => {
  // const validation = createBusinessValidator.validate(data);
  // if (validation.error) return ResourceNotFoundError(validation.error);
  const { organisation, scholarship_id, submission_requirements, link_requirements, file_requirements, userId, ...rest } = data;

  const existingScholarship = await findScholarship({ id: scholarship_id }, []);
  if (!existingScholarship) throw Error('Sorry, Scholarship does not exist');

  const existingEligibility = await findScholarshipEligibility({ scholarship_id }, []);
  if (existingEligibility) throw Error('Sorry, Scholarship Eligibility already field');

  const link_reference = randomstring.generate({ length: 5, capitalization: 'lowercase', charset: 'alphanumeric' });
  const asset_reference = randomstring.generate({ length: 5, capitalization: 'lowercase', charset: 'alphanumeric' });

  await Promise.all(
    file_requirements.map(({ name, url }) =>
      createAsset({ imagePath: url, user: userId, trigger: 'scholarship_eligibility', organisation, name, reference: asset_reference }),
    ),
  );
  await Promise.all(
    link_requirements.map(({ name, url }) =>
      saveLinkREPO({ link: url, user: userId, name, trigger: 'scholarship_eligibility', organisation, reference: link_reference }),
    ),
  );

  const response = await saveScholarshipEligibilityREPO({
    scholarship_id,
    submission_requirements: submission_requirements.toString(),
    link_reference,
    asset_reference,
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

export const getScholarships = async (): Promise<any> => {
  try {
    const existingCompany = await findMultipleScholarships({}, [], ['Status', 'Currency', 'Eligibility', 'User', 'Sponsorships', 'Applications']);
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
      ['Status', 'Currency', 'Eligibility', 'Eligibility.Links', 'Eligibility.Assets', 'User', 'Sponsorships.User', 'Sponsorships', 'Applications'],
    );
    if (!existingCompany) throw Error('Sorry, no business has been created');

    return sendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    // log(Log.fg.red, e);
    console.log({ e });
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};
