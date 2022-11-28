export interface IAddress {
  id: number;
  user_mobile: string;
  address: string;
  country: string;
  state: string;
  city_name: string;
  city_code: string;
  town_name: string;
  town_id: string;
  lat: string;
  long: string;
  default: boolean;
  business_mobile?: string;
  is_business?: boolean;
  created_at: Date;
  deleted: boolean;
  deleted_at: Date;
}

export interface IStatus {
  id: number;
  value: string;
  created_at: Date;
  updated_at?: Date;
}

export interface IUser {
  id: string;
  email: string;
  password: string;
  code?: string;
  phone?: string;
  user_type: string;
  business_name: string;
  country: string;
  phone_number: number;
  first_name: string;
  last_name: string;
  image: string;
  title: string;
  employer: string;
  job_title: string;
  industry_skills: string;
  job_status: string;
  state: string;
  area: string;
  city: string;
  bio: string;
  provider: string;
  provider_id: string;
  facebook: string;
  linkedin: string;
  twitter: string;
  website: string;
  slug: string;
  address: string;
  instagram: string;
  logo: string;
  organisation_email: string;
  organisation_headline: string;
  organisation_bio: string;
  organisation_code: string;
  organisation_phone: string;
  organisation_address: string;
  organisation_country: string;
  organisation_state: string;
  organisation_area: string;
  organisation_city: string;
  remember_token: string | null;
  email_verified_at?: Date;
  created_at: Date;
  updated_at?: Date;
}

export interface IPhoneNumber {
  id: number;
  countryCode: string;
  localFormat: string;
  internationalFormat: string;
  active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IPassword {
  id: number;
  user: string;
  password: string;
  organization: number;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface IEmailMessage {
  purpose: string;
  recipientEmail: string;
  templateInfo: { [key: string]: string };
}

export interface IBusiness {
  id: number;
  name: string;
  description: string;
  logo?: string;
  active: boolean;
  phone_number: string;
  reference: string;
  owner: number;
  // default: boolean;
  created_at: Date;
  updated_at: Date;
  // Owner: IUser;
}

export interface IImage {
  id: number;
  table_id: number;
  table_type: string;
  url: string;
  available: boolean;
  reference: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICurrency {
  id: number;
  code: string;
  short_code: string;
  currency_name: string;
  currency_unit_name: string;
  status: number;
  icon?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IScholarship {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image: string;
  amount: number;
  image_id: number;
  org_id: number;
  frequency: string;
  winners: number;
  state: string;
  status: number;
  currency: string;
  deadline_note: string;
  application_deadline: Date;
  created_at: Date;
  updated_at: Date;
  currencyId: ICurrency;
}

export interface IOrganisation {
  id: number;
  name: string;
  email: string;
  bio: string;
  status: number;
  logo: string;
  phone_number: string;
  owner: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

export interface ISTATUSES {
  ACTIVE: number;
  INACTIVE: number;
  PAUSE: number;
  FREEZE: number;
  BLOCKED: number;
  VERIFIED: number;
  UNVERIFIED: number;
  INVITED: number;
  CANCELLED: number;
  DELETED: number;
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  SUCCESS: number;
  FAILED: number;
  DECLINED: number;
  PAID: number;
  PROCESSING: number;
  PROCESSED: number;
}

export interface IAssets {
  id: number;
  name: string;
  file_name: string;
  status: number;
  file_type: string;
  file_format: string;
  bytes: number;
  url: string;
  organisation: number;
  user: string;
  reference: string;
  trigger: string;
  created_at: Date;
  updated_at: Date;
}

export interface IProductCategory {
  id: number;
  image: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface IProduct {
  id: number;
  reference: string;
  name: string;
  unit_price: number;
  quantity: number;
  description?: string;
  image_reference: string;
  product_categories: number;
  business: number;
  publish: boolean;
  unlimited: boolean;
  expire_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ITransactions {
  id: number;
  reference: string;
  description?: string;
  purpose: string;
  processor_reference: string;
  processor: string;
  response: string;
  amount: number;
  txn_type: 'debit' | 'credit';
  shopper: number;
  business: number;
  created_at: Date;
  updated_at: Date;
}

export interface IAddresses {
  id: number;
  street: string;
  area: string;
  country: string;
  state: string;
  city: string;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICart {
  id: number;
  reference: string;
  completed: boolean;
  shopper: number;
  business: number;
  amount: number;
  quantity: number;
  completed_at: Date;
  deleted_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ICartProduct {
  id: number;
  quantity: number;
  product: number;
  cart: number;
  deleted_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IOrder {
  id: number;
  reference: string;
  payment_reference: string;
  shopper_address: number;
  business_address: number;
  shopper: number;
  business: number;
  external_reference?: string;
  cart_reference: string;
  metadata?: { [key: string]: any };
  processed_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ICurrencyRate {
  id: number;
  currency: string;
  base_currency: string;
  buy_rate: number;
  sell_rate: number;
  created_at: Date;
  updated_at: Date;
}

export interface IScholarshipEligibility {
  id: string;
  scholarship_id: string;
  applicant_description: string;
  submission_requirements: string;
  essay_requirements: string;
  link_requirements: string;
  file_requirements: string;
  image_requirements: string;
  specific_schools: boolean;
  eligible_schools: string;
  education_level: string;
  link_reference: string;
  asset_reference: string;
  state?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ISponsorships {
  id: string;
  scholarship_id: string;
  accept_contribution?: string;
  minimum_amount: number;
  currency: string;
  fees_paid_by?: string;
  created_at: Date;
  updated_at: Date;
  user: string;
  payment_type: string;
  frequency: string;
  organisation?: number;
  status?: number;
  anonymous: boolean;
  take_transaction_charge: boolean;
}

export interface IScholarshipApplication {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image: string;
  amount: number;
  frequency: string;
  winners: number;
  state: string;
  status: number;
  currency: string;
  application_deadline: Date;
  created_at: Date;
  updated_at: Date;
}
export interface ILink {
  id: number;
  name: string;
  link: string;
  status: number;
  trigger: string;
  reference: string;
  organisation: number;
  user: string;
  created_at: Date;
  updated_at: Date;
}
