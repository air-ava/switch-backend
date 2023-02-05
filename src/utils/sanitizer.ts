import { Application } from 'express';
import {
  IBusiness,
  ICurrency,
  ILink,
  IPhoneNumber,
  IScholarship,
  IUser,
  ISponsorships,
  IAssets,
  IScholarshipEligibility,
  IScholarshipApplication,
  IScholarshipRequirement,
} from '../database/modelInterfaces';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
// import { IBusiness, ICurrency, ILink, IPhoneNumber, IScholarship, ISTATUSES, IUser } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';

export const Sanitizer = {
  jsonify(payload: any) {
    try {
      return payload.toJSON();
      // eslint-disable-next-line no-empty
    } catch (e) {}
    return payload;
  },

  sanitizeCurrency(payload: ICurrency) {
    if (!payload) return null;
    const { id, status, Status, Scholarships, CurrencyRate, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      scholarships: Scholarships && Sanitizer.sanitizeAllArray(Scholarships, Sanitizer.sanitizeScholarship),
      currencyRate: CurrencyRate && Sanitizer.sanitizeAllArray(CurrencyRate, Sanitizer.sanitizeCurrencyRate),
    };
    return sanitized;
  },

  sanitizeAmount(payload: any[], key: { currency: string; amount: string }): any {
    if (!Array.isArray(payload)) return { USD: 0 };
    if (!payload.length) return { USD: 0 };
    const response: { [key: string]: string } = {};
    payload.forEach((item) => {
      if (!response[item[key.currency]]) response[item[key.currency]] = item[key.amount];
      else response[item[key.currency]] += item[key.amount];
    });
    return response;
  },

  sanitizePartner(payload: ICurrency) {
    if (!payload) return null;
    const { id, status, Status, Scholarships, LogoId, Owner, phone, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      partner: Owner && Sanitizer.sanitizeUser(Owner),
      phone: Sanitizer.sanitizePhoneNumber(phone),
      logo: LogoId && Sanitizer.sanitizeAsset(LogoId),
      scholarships: Scholarships && Sanitizer.sanitizeAllArray(Scholarships, Sanitizer.sanitizeScholarship),
    };
    return sanitized;
  },

  sanitizeCurrencyRate(payload: ICurrency) {
    if (!payload) return null;
    const { id, status, Status, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
    return sanitized;
  },

  sanitizeRequirements(payload: IScholarshipRequirement, extra?: string) {
    if (!payload) return null;
    const { status, Status, Links, Assets, ...rest } = Sanitizer.jsonify(payload);

    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      links: Links && Sanitizer.sanitizeSortLinksAssets(Links, 'reference', extra),
      assets: Assets && Sanitizer.sanitizeSortLinksAssets(Assets, 'reference', extra),
    };
    return sanitized;
  },

  sanitizeApplicationLink(payload: ILink, extra?: string) {
    if (!payload) return null;
    const { id, status, Status, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
    return sanitized;
  },

  getStatusById(object: any, value: string): any {
    return Object.keys(object).find((key) => object[key] === value);
  },

  sanitizeScholarship(payload: IScholarship, extra?: string) {
    if (!payload) return null;
    const { status, Status, Currency, Eligibility, Sponsorships, Applications, User, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      currency: Currency && Sanitizer.sanitizeCurrency(Currency),
      eligibility: Eligibility && Sanitizer.sanitizeEligibility(Eligibility, extra),
      amount_raised: Sponsorships && Sanitizer.sanitizeAmount(Sponsorships, { currency: 'currency', amount: 'minimum_amount' }),
      sponsorships: Sponsorships && Sanitizer.sanitizeAllArray(Sponsorships, Sanitizer.sanitizeSponsorship),
      partner: User && Sanitizer.sanitizeUser(User),
      applications: Applications && Sanitizer.sanitizeAllArray(Applications, Sanitizer.sanitizeApplication),
    };
    return sanitized;
  },

  sanitizeAllArray(payload: any, object: any, extra?: string): any[] {
    if (!Array.isArray(payload)) return [];
    return payload.map((item) => object(item, extra && extra));
  },

  sanitizeUser(payload: IUser): any {
    if (!payload) return null;
    const {
      password,
      phone_number,
      remember_token,
      phoneNumber,
      image,
      title,
      employer,
      job_title,
      industry_skills,
      job_status,
      country,
      state,
      area,
      city,
      bio,
      provider,
      provider_id,
      facebook,
      linkedin,
      twitter,
      website,
      slug,
      address,
      instagram,
      logo,
      organisation_email,
      organisation_headline,
      organisation_bio,
      organisation_code,
      organisation_phone,
      organisation_address,
      organisation_country,
      organisation_state,
      organisation_area,
      organisation_city,
      email_verified_at,
      address_id,
      phone,
      ...rest
    } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      emailVerified: !!email_verified_at,
      ...(phoneNumber && { phone_number: phoneNumber.internationalFormat }),
      phoneNumber: Sanitizer.sanitizePhoneNumber(phoneNumber),
    };
    return sanitized;
  },

  sanitizeSponsorship(payload: ISponsorships): any {
    if (!payload) return null;
    const { password, user, User, status, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      sponsor: User && Sanitizer.sanitizeUser(User),
    };
    return sanitized;
  },

  sanitizeApplication(payload: IScholarshipApplication): any {
    if (!payload) return null;
    const { id, status, Links, Assets, Address, Scholarship, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      id,
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      files: Assets && Sanitizer.sanitizeAllArray(Assets, Sanitizer.sanitizeAsset),
      links: Links && Sanitizer.sanitizeAllArray(Assets, Sanitizer.sanitizeLink),
      address: Address && Address,
      scholarship: Scholarship && Sanitizer.sanitizeScholarship(Scholarship, id),
    };
    return sanitized;
  },

  sanitizeEligibility(payload: IScholarshipEligibility, extra?: string): any {
    if (!payload) return null;
    const { password, status, Requirements, ...rest } = Sanitizer.jsonify(payload);
    const { linkRequirements, fileRequirements } = Sanitizer.sanitizeSortRequirements(Requirements);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      fileRequirements: fileRequirements && Sanitizer.sanitizeAllArray(fileRequirements, Sanitizer.sanitizeRequirements, extra),
      linkRequirements: linkRequirements && Sanitizer.sanitizeAllArray(linkRequirements, Sanitizer.sanitizeRequirements, extra),
    };
    return sanitized;
  },

  sanitizeSortRequirements(payload: any[]): any {
    if (!Array.isArray(payload)) return [];
    const response: any = {
      linkRequirements: [],
      fileRequirements: [],
    };
    payload.forEach((value: any) => {
      if (value.requirement_type === 'file') {
        if (!response.fileRequirements.length) response.fileRequirements = [value];
        else response.fileRequirements.push(value);
      }
      if (value.requirement_type === 'link') {
        if (!response.linkRequirements.length) response.linkRequirements = [value];
        else response.linkRequirements.push(value);
      }
    });
    return response;
  },

  sanitizeSortLinksAssets(payload: any[], key: string, extra?: string): any {
    if (!Array.isArray(payload)) return [];
    let response: any[] = [];
    payload.forEach((value: any) => {
      if (value[key] === extra) {
        if (!response.length) response = [value];
        else response.push(value);
      }
    });
    return response;
  },

  sanitizePhoneNumber(payload: IPhoneNumber): any {
    if (!payload) return null;
    const { id, ...rest } = Sanitizer.jsonify(payload);
    return rest;
  },

  sanitizeLink(payload: ILink): any {
    if (!payload) return null;
    const { status, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
  },

  sanitizeAsset(payload: IAssets): any {
    if (!payload) return null;
    const { status, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
  },

  sanitizeAddress(payload: IAssets): any {
    if (!payload) return null;
    const { status, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
  },

  sanitizeOrganization(payload: IAssets): any {
    if (!payload) return null;
    const { status, Owner, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      owner: Owner && Sanitizer.sanitizeUser(Owner),
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
  },

  sanitizeSchool(payload: IAssets): any {
    if (!payload) return null;
    const { status, organisation_id, phone_number, address_id, Address, phoneNumber, Organisation, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      address: Address && Sanitizer.sanitizeAddress(Address),
      phoneNumber: phoneNumber && Sanitizer.sanitizePhoneNumber(phoneNumber),
      organisation: Organisation && Sanitizer.sanitizeOrganization(Organisation),
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
  },
};

export const jsonify = (payload: any): { [key: string]: any } => {
  try {
    return payload.toJSON();
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return payload;
};

export const sanitizePhoneNumber = (payload: IPhoneNumber): any => {
  if (!payload) return null;
  const { id, ...rest } = jsonify(payload);
  return rest;
};

export const sanitizePhoneNumbers = (payload: any): any => {
  if (!Array.isArray(payload)) return [];
  return payload.map(sanitizePhoneNumber);
};

export const sanitizeUser = (payload: IUser): any => {
  if (!payload) return null;
  const { password, phone_number, remember_token, phoneNumber, ...rest } = jsonify(payload);
  const sanitized = {
    ...rest,
    ...(phoneNumber && { phone_number: phoneNumber.internationalFormat }),
    phoneNumber: sanitizePhoneNumber(phoneNumber),
  };
  return sanitized;
};

export const getStatusById = (object: any, value: string): any => {
  return Object.keys(object).find((key) => object[key] === value);
};

export const sanitizeAllArray = (payload: any, object: any): any[] => {
  if (!Array.isArray(payload)) return [];
  return payload.map(object);
};

export const sanitizeCurrency = (payload: ICurrency): any => {
  if (!payload) return null;
  const { id, status, Scholarships, ...rest } = jsonify(payload);
  const sanitized = {
    ...rest,
    status: status && getStatusById(STATUSES, status).toLowerCase(),
    // scholarships: Scholarships && sanitizeAllArray(Scholarships, sanitizeScholarship),
  };
  return sanitized;
};

export const sanitizeScholarship = (payload: IScholarship): any => {
  if (!payload) return null;
  const { status, Status, Currency, ...rest } = jsonify(payload);
  const sanitized = {
    ...rest,
    status: (status && getStatusById(STATUSES, status).toLowerCase()) || Status.value.toLowerCase(),
    Currency: Currency && sanitizeCurrency(Currency),
  };
  return sanitized;
};

export const sanitizeUsers = (payload: any): any => {
  if (!Array.isArray(payload)) return null;
  return payload.map(sanitizeUser);
};

export const sanitizeBusiness = (payload: IBusiness): any => {
  if (!payload) return null;
  const { id, phone_number, phone, owners, ...rest } = jsonify(payload);
  const sanitized = {
    ...rest,
    ...(phone && { phone_number: phone.internationalFormat }),
    ...(phone && { phone: sanitizePhoneNumber(phone) }),
    ...(owners && { owner: sanitizeUser(owners) }),
  };
  return sanitized;
};

export const sanitizeBusinesses = (payload: any): any => {
  if (!Array.isArray(payload)) return null;
  return payload.map(sanitizeBusiness);
};
