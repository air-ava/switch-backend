import { log } from 'winston';
import { Organisation } from '../database/models/organisation.model';
import { getQueryRunner } from '../database/helpers/db';
import { getOneBuinessREPO, createBusinessREPO, updateBusinessREPO } from '../database/repositories/business.repo';
import { findMultipleScholarships, findScholarship, saveScholarshipREPO } from '../database/repositories/scholarship.repo';
import { createBusinessDTO } from '../dto/business.dto';
import { ResourceNotFoundError, sendObjectResponse, oldSendObjectResponse, BadRequestException } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { Log } from '../utils/logs';
import { currencyFormatter, randomstringGeenerator } from '../utils/utils';
import { createBusinessValidator } from '../validators/business.validator';
import { createAsset } from './assets.service';
import { findOrCreatePhoneNumber, findOrCreateImage } from './helper.service';

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

export const getScholarships = async (): Promise<any> => {
  try {
    const existingCompany = await findMultipleScholarships({}, [], ['Status', 'Currency', 'Eligibility', 'User', 'Sponsorships', 'Applications']);
    if (!existingCompany.length) throw Error('Sorry, no business has been created');

    return oldSendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    log(Log.fg.red, e);
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};

export const getScholarship = async (code: string): Promise<any> => {
  try {
    const existingCompany = await findScholarship({ id: code }, [], ['Status', 'Currency', 'Eligibility', 'User', 'Sponsorships', 'Applications']);
    if (!existingCompany) throw Error('Sorry, no business has been created');

    return sendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    log(Log.fg.red, e);
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};
