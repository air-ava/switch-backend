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
  IStudentClass,
  ITransactions,
} from '../database/modelInterfaces';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
// import { IBusiness, ICurrency, ILink, IPhoneNumber, IScholarship, ISTATUSES, IUser } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { getStudent } from '../database/repositories/student.repo';

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
      Avatar,
      Address,
      School,
      Organisation,
      Wallet,
      ...rest
    } = Sanitizer.jsonify(payload);

    const sanitized = {
      ...rest,
      reference: slug,
      ...(School && { schoolOnboardingStatus: Sanitizer.getStatusById(STATUSES, School.status).toLowerCase() }),
      avatar: Avatar && Sanitizer.sanitizeAsset(Avatar),
      address: Address && Sanitizer.sanitizeAddress(Address),
      emailVerified: !!email_verified_at,
      email_verified_at,
      ...(phoneNumber && { phone_number: phoneNumber.internationalFormat }),
      phoneNumber: Sanitizer.sanitizePhoneNumber(phoneNumber),
      school: School && Sanitizer.sanitizeSchool(School),
      organisation: Organisation && Sanitizer.sanitizeOrganization(Organisation),
      wallet: Wallet && Sanitizer.sanitizeWallet(Wallet),
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
    const { id, status, Links, Assets, Address, Scholarship, School, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      id,
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      files: Assets && Sanitizer.sanitizeAllArray(Assets, Sanitizer.sanitizeAsset),
      links: Links && Sanitizer.sanitizeAllArray(Assets, Sanitizer.sanitizeLink),
      address: Address && Address,
      scholarship: Scholarship && Sanitizer.sanitizeScholarship(Scholarship, id),
      school: School && Sanitizer.sanitizeSchool(School),
    };
    return sanitized;
  },

  sanitizeWallet(payload: IScholarshipApplication): any {
    if (!payload) return null;
    const { id, userId, User, status, transaction_pin, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      id,
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      owner: User && Sanitizer.sanitizeUser(User),
    };
    return sanitized;
  },

  async sanitizeTransactions(payload: any): Promise<any>  {
    if (!Array.isArray(payload)) return null;
    const response = await Promise.all(payload.map(Sanitizer.sanitizeTransaction));
    return response;
  },

  async sanitizeTransaction(payload: any): Promise<any> {
    if (!payload) return null;
    const { id, userId, User, status, Wallet, walletId, document_reference, Reciepts, metadata, ...rest } = Sanitizer.jsonify(payload);
    let Student;
    if (metadata && metadata.collectRequestId && String(metadata.username).length > 7) {
      Student = await getStudent({ uniqueStudentId: metadata.username }, [], ['User', 'Classes', 'Classes.ClassLevel']);
    }
    const sanitized = {
      id,
      ...rest,
      metadata,
      recieptReference: document_reference,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      recipient: User && Sanitizer.sanitizeUser(User),
      payer: Student && Sanitizer.sanitizeStudent(Student),
      wallet: Wallet && Sanitizer.sanitizeWallet(Wallet),
      reciepts: Reciepts && Sanitizer.sanitizeAllArray(Reciepts, Sanitizer.sanitizeAsset),
    };
    return sanitized;
  },
  sanitizeLightTransaction(payload: any): any {
    if (!payload) return null;
    // console.log({ payload });
    const { id, userId, User, status, Wallet, walletId, document_reference, Reciepts, metadata, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      id,
      ...rest,
      metadata,
      recieptReference: document_reference,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
    // console.log({ sanitized });
    return sanitized;
  },

  sanitizeStudent(payload: any): any {
    if (!payload) return null;
    const { id, status, User, userId, School, schoolId, uniqueStudentId, Classes, ...rest } = Sanitizer.jsonify(payload);
    const studentCurrentClass = Classes && Classes.filter((value: IStudentClass) => value.status === STATUSES.ACTIVE);
    const sanitized = {
      id,
      ...rest,
      studentId: uniqueStudentId,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      user: User && Sanitizer.sanitizeUser(User),
      school: School && Sanitizer.sanitizeSchool(School),
      class: Classes && studentCurrentClass[0].ClassLevel,
      classes: Classes && Sanitizer.sanitizeAllArray(Classes, Sanitizer.sanitizeStudentClass),
    };
    return sanitized;
  },

  sanitizeStudentClass(payload: IScholarshipApplication): any {
    if (!payload) return null;
    const { id, status, ClassLevel, classId, Student, studentId, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      id,
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      student: Student && Sanitizer.sanitizeStudent(Student),
      classLevel: ClassLevel && Sanitizer.sanitizeSchool(ClassLevel),
    };
    return sanitized;
  },

  sanitizeDashboardStats(payload: IScholarshipApplication): any {
    if (!payload) return null;
    const { totalIn, totalOut, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      totalIn: totalIn || '0',
      totalOut: totalOut || '0',
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

  sanitizeSchool(payload: any): any {
    if (!payload) return null;

    // console.log({ payload });

    const { education_level, status, organisation_id, phone_number, address_id, Address, phoneNumber, Organisation, Logo, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      education_level: education_level ? education_level.split(',') : [],
      address: Address && Sanitizer.sanitizeAddress(Address),
      phoneNumber: phoneNumber && Sanitizer.sanitizePhoneNumber(phoneNumber),
      organisation: Organisation && Sanitizer.sanitizeOrganization(Organisation),
      logo: Logo && Sanitizer.sanitizeAsset(Logo),
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
  },
  sanitizeBank(payload: any): any {
    if (!payload) return null;
    const { status, walletId, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
  },

  filterTransactionsByPurpose(transactions: ITransactions[], purpose: string): any {
    const filteredTransaction = transactions.filter((transaction) => transaction.purpose.includes(purpose));
    return filteredTransaction[0];
  },

  sanitizeSettlement(payload: any): any {
    if (!payload) return null;
    const { status, processor_transaction_id, Transactions, creditTransactions, ...rest } = Sanitizer.jsonify(payload);
    const Transaction = Sanitizer.filterTransactionsByPurpose(Transactions, 'Withdraw:Settlement');
    return {
      ...rest,
      currency: Transactions && Transactions[0].Wallet && Transactions[0].Wallet.currency,
      payment: Transaction && Sanitizer.sanitizeLightTransaction(Transaction),
      paymentTransactions: Transaction && Transactions && Sanitizer.sanitizeAllArray(Transactions, Sanitizer.sanitizeLightTransaction),
      transactions: creditTransactions && Sanitizer.sanitizeAllArray(creditTransactions, Sanitizer.sanitizeLightTransaction),
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
