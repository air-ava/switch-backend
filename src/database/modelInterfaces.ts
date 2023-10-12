import { FindOperator } from 'typeorm';

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

export interface ISettings {
  id: number;
  key: string;
  value: string;
  created_at: Date;
  updated_at?: Date;
}

// export interface IUser {
//   id: string;
//   email: string;
//   password: string;
//   code?: string;
//   phone?: string;
//   user_type: string;
//   business_name: string;
//   country: string;
//   phone_number: number;
//   first_name: string;
//   last_name: string;
//   image: string;
//   title: string;
//   employer: string;
//   job_title: string;
//   industry_skills: string;
//   job_status: string;
//   state: string;
//   area: string;
//   city: string;
//   bio: string;
//   provider: string;
//   provider_id: string;
//   facebook: string;
//   linkedin: string;
//   twitter: string;
//   website: string;
//   slug: string;
//   address: string;
//   instagram: string;
//   logo: string;
//   organisation_email: string;
//   organisation_headline: string;
//   organisation_bio: string;
//   organisation_code: string;
//   organisation_phone: string;
//   organisation_address: string;
//   organisation_country: string;
//   organisation_state: string;
//   organisation_area: string;
//   organisation_city: string;
//   organisation: number;
//   remember_token: string | null;
//   email_verified_at?: Date;
//   created_at: Date;
//   updated_at?: Date;
//   address_id: number;
//   avatar: number;
// }

export interface IUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  other_name: string;
  code?: string;
  phone?: string;
  image: string;
  title: string;
  organisation: number;
  status: number;
  job_title: string;
  country: string;
  provider: string;
  provider_id: string;
  slug: string;
  organisation_email: string;
  user_type: string;
  business_name: string;
  remember_token: string | null;
  phone_number: number;
  password: string;
  address_id: number;
  avatar: number;
  created_at: Date;
  email_verified_at?: Date;
  updated_at?: Date;
}

export interface IIndividual {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'male' | 'female' | 'others';
  type: string;
  avatar: number;
  job_title: number;
  status: number;
  metadata: string;
  school_id: number;
  phone_number: number;
  address_id: number;
  created_at: Date;
  updated_at: Date;
}
export interface IPhoneNumber {
  id: number;
  countryCode: string;
  localFormat: string;
  internationalFormat: string;
  active: boolean;
  is_verified: boolean;
  remember_token: string;
  verified_at: Date;
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
  created_at: Date;
  updated_at: Date;
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

export interface ISchools {
  id: number;
  code: string;
  country: string;
  state: string;
  name: string;
  education_level: string;
  email: string;
  description: string;
  document_reference: string;
  website: string;
  status: number;
  logo: number;
  organisation_id?: number;
  phone_number?: number;
  address_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface IDocumentRequirement {
  id: number;
  requirement_type: 'link' | 'number' | 'file' | 'text';
  required: boolean;
  status: number;
  name: string;
  type: string;
  process: string;
  country: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface IDocuments {
  id: number;
  reference: string;
  type: string;
  metadata: string;
  status: number;
  number: string;
  asset_id: string;
  link_id: number;
  processor: string;
  response: string;
  country: string;
  trigger: string;
  entity: string;
  entity_id: string;
  expiry_date?: Date;
  issuing_date?: Date;
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
  other_rewards: string;
  external_sponsorship?: boolean;
  application_deadline: Date;
  created_at: Date;
  updated_at: Date;
  currencyId: ICurrency;
}

export interface IWallets {
  id: number;
  userId: string;
  currency: string;
  type: 'temporary' | 'permanent';
  entity: string;
  entity_id: string;
  balance: number;
  ledger_balance: number;
  uniquePaymentId: string;
  has_updated_unique_payment_id: boolean;
  transaction_pin: string;
  status: number;
  expiry_date?: Date;
  transaction_webhook_url: string;
  created_at: Date;
}

export interface IThirdPartyLogs {
  id: number;
  event: string;
  message: string;
  endpoint: string;
  school: number;
  endpoint_verb: string;
  status_code: string;
  provider_type: string;
  provider: string;
  payload: string;
  reference: string;
  created_at: Date;
  updated_at: Date;
}

export interface IOrganisation {
  id: number;
  name: string;
  email: string;
  bio: string;
  status: number;
  logo: string;
  type: string;
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
  entity: string;
  entity_id: string;
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

// export interface ITransactions {
//   id: number;
//   user_id: string;
//   reference: string;
//   description?: string;
//   purpose: string;
//   response?: string;
//   currency?: string;
//   amount: number;
//   txn_type: 'debit' | 'credit';
//   metadata: { [key: string]: number | string };
//   created_at: Date;
//   updated_at: Date;
// }

export interface ITransactions {
  id: number;
  walletId: number;
  status?: number;
  userId: string;
  txn_type: 'debit' | 'credit';
  amount: number;
  purpose: string | FindOperator<string> | any;
  note: string;
  document_reference: string;
  reference: string;
  description: string;
  balance_before: number;
  balance_after: number;
  channel?: string;
  metadata: { [key: string]: string | number };
  created_at: Date;
}

export interface IMobileMoneyTransactions {
  id: number;
  tx_reference: string;
  status: number;
  processor: string;
  processor_transaction_id: string;
  response?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IPendingPayments {
  id: number;
  org_id: number;
  reference: string;
  sender_id: string;
  recipient_id: string;
  description: string;
  status: number;
  amount: number;
  applied_to: string;
  applied_id: string;
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

export interface IQuestionnaire {
  id: number;
  question_id: number;
  answer_text: string;
  answer_boolean: boolean;
  user_id: string;
  title_id: number;
  created_at: Date;
  updated_at?: Date;
}

export interface IQuestions {
  id: number;
  question: string;
  type: 'text' | 'radio' | 'checkbox';
  title_id: number;
  created_at: Date;
  updated_at?: Date;
}

export interface IQuestionnaireTitle {
  id: number;
  title: string;
  trigger: string;
  created_at: Date;
  updated_at?: Date;
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
  eligible_school: string;
  education_level: string;
  link_reference?: string;
  asset_reference?: string;
  state?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IScholarshipRequirement {
  id: number;
  name: string;
  reference: string;
  requirement_type: string;
  trigger: string;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface IScholarshipRequirementB {
  id: number;
  name: string;
  reference: string;
  requirement_type: string;
  status: number;
  created_at: Date;
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

export interface ISponsorshipConditions {
  id: number;
  scholarship_id: string;
  minimum_amount: number;
  currency: string;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface IScholarshipApplication {
  id: string;
  scholarship_id: string;
  first_name: string;
  last_name: string;
  email: string;
  code?: string;
  phone_number: string;
  education_level: string;
  address: string;
  country: string;
  state: string;
  area: string;
  city: string;
  facebook: string;
  linkedin: string;
  twitter: string;
  website: string;
  essay: string;
  link: string;
  document: string;
  image: string;
  filenames: string;
  created_at: Date;
  updated_at?: Date;
  phone: number;
  address_id: number;
  document_reference: string;
  payment_reference: string;
  user: string;
  status: number;
  social: number;
}

export interface ISocial {
  id: number;
  type: string;
  link: string;
  status: number;
  handle: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}
export interface ILink {
  id: number;
  name: string;
  link: string;
  status: number;
  trigger: string;
  entity: string;
  entity_id: string;
  reference: string;
  organisation: number;
  user: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICard {
  id: number;
  user_id: string;
  first6: string;
  last4: string;
  authorization: string;
  issuer: string;
  country: string;
  type: string;
  processor: string;
  default: boolean;
  currency: string;
  status: number;
  deleted_at: Date;
  created_at: Date;
}

export interface ICardTransactions {
  id: number;
  user_id: string;
  tx_reference: string;
  processor: string;
  processor_response: string;
  processor_transaction_id: string;
  processor_transaction_reference: string;
  updated_at: Date;
  created_at: Date;
}

export interface ITransaction {
  id: number;
  user_id: number;
  txn_type: 'debit' | 'credit';
  amount: number;
  purpose: string;
  reference: string;
  description: string;
  metadata: { [key: string]: string | number };
  created_at: Date | any;
  updated_at?: Date;
}

export interface IStudent {
  id: number;
  schoolId: number;
  uniqueStudentId: string;
  userId: string;
  status: number;
  paymentTypeId: number;
  defaultEmail: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IStudentClass {
  id: number;
  studentId: number;
  classId: number;
  status: number;
  session: number;
  school_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface IClassLevel {
  id: number;
  code: string;
  education_level: string;
  class: string;
  class_short_name: string;
  country: string;
  created_at: Date;
  updated_at: Date;
}

export interface ILienTransaction {
  id: number;
  amount: number;
  status?: number;
  walletId: number;
  reference: string;
  metadata: { [key: string]: string | number };
  type?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IBanks {
  id: number;
  provider: string;
  country: string;
  currency: string;
  walletId: number;
  status: number;
  number: string;
  type: 'owner' | 'beneficiary';
  account_name: string;
  bank_name: string;
  bank_code: string;
  bank_routing_number: string;
  metadata: { [key: string]: string | number };
  default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ISettlementTransactions {
  id: number;
  processor: string;
  processor_transaction_id: string;
  response: string;
  tx_reference: string;
  tx_count: number;
  bankId: number;
  metadata?: { [key: string]: string | number };
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface IBankTransfers {
  id: number;
  walletId: number;
  amount: number;
  bankId: number;
  status: number;
  tx_reference: string;
  narration: string;
  processor: string;
  response: string;
  sessionId: string;
  document_reference: string;
  metadata: string;
  created_at: Date;
  updated_at: Date;
}
export interface IBackOfficeUsers {
  id: number;
  code: string;
  email: string;
  name: string;
  slug: string;
  role: string;
  remember_token: string | null;
  password: string;
  avatar: number;
  status: number;
  created_at: Date;
  email_verified_at?: Date;
  updated_at?: Date;
}

export interface IJobTitle {
  id: number;
  name: string;
  created_at: Date;
  updated_at?: Date;
}

export interface IBackOfficeBanks {
  id: number;
  country: string;
  currency: string;
  number: string;
  account_name: string;
  bank_name: string;
  status: number;
  created_at: Date;
  updated_at?: Date;
}

export interface IPaymentType {
  id: number;
  code: string;
  value: string;
  name: string;
  created_at: Date;
  updated_at?: Date;
}

export interface IStudentGuardian {
  id: number;
  code: string;
  relationship: string;
  studentId: number;
  individualId: number;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface ISchoolClass {
  id: number;
  status: number;
  class_id: number;
  school_id: number;
  code: string;
  created_at: Date;
  updated_at: Date;
}

export interface ISchoolPeriod {
  id: number;
  school_id: number;
  education_level: string;
  period: string;
  session_id: number;
  schedule_id: number;
  country: string;
  status: number;
  start_date: Date;
  expiry_date: Date | null;
  code: string;
  created_at: Date;
  updated_at: Date;
}

export interface ISchoolSession {
  id: number;
  education_level: string;
  session: string;
  country: string;
  schedule_id: number;
  name: string;
  status: number;
  start_date: Date;
  expiry_date: Date | null;
  code: string;
  created_at: Date;
  updated_at: Date;
}

export interface ISchedule {
  id: number;
  cron_id: string;
  status: number;
  cron_expression: string;
  code: string;
  created_at: Date;
  updated_at: Date;
}

export interface ISchoolProduct {
  id: number;
  name: string;
  feature_name: string;
  payment_type_id: number;
  product_type_id: number;
  description: string;
  image: number;
  amount: number;
  currency: string;
  school_class_id: number | null;
  school_id: number;
  status: number;
  period: number | null;
  session: number | null;
  code: string;
  created_at: Date;
  updated_at: Date;
}

export interface IProductTransactions {
  id: number;
  tx_reference: string;
  session: string;
  beneficiaryProductPaymentId: number;
  amount: number;
  outstanding_before: number;
  outstanding_after: number;
  payer: number;
  metadata: { [key: string]: number | string };
  status: number;
  student_class: number;
  code: string;
  created_at: Date;
  updated_at: Date;
}

export interface IPaymentContacts {
  id: number;
  name?: string;
  school: number;
  phone_number?: string;
  address_id?: number;
  email?: string;
  relationship?: string;
  gender?: string;
  status: number;
  code: string;
  created_at: Date;
  updated_at: Date;
}

export interface IBeneficiaryProductPayment {
  id: number;
  beneficiary_type: string;
  product_currency: string;
  beneficiary_id: number;
  product_id: number;
  status: number;
  is_default_amount: boolean;
  custom_amount: number;
  amount_paid: number;
  amount_outstanding: number;
  code: string;
  created_at: Date;
  updated_at: Date;
}

export interface IEducationLevel {
  id: number;
  code: string;
  feature_name: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface IEducationPeriod {
  id: number;
  code: string;
  level: string;
  feature_name: string;
  rank: number;
  education_level: string;
  created_at: Date;
  updated_at: Date;
}

export interface IProductType {
  id: number;
  code: string;
  name: string;
  slug: string;
  school_id: number | null;
  status: number;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface IPreference {
  id: number;
  code: string;
  entity: string;
  entity_id: number;
  configuration: JSON;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface IMobileMoneyPayment {
  id: number;
  status: number;
  amount: number;
  fee: number;
  currency: string;
  narration: string;
  description: string;
  code: string;
  transaction_reference: string;
  processor_reference: string;
  processor: string;
  response: string;
  metadata: JSON;
  receiver: number;
  type: string;
  created_at: Date;
  updated_at: Date;
}

export interface IAuditLog {
  id: number;
  code?: string;
  event?: string;
  user_type?: string;
  user_id?: number;
  table_type?: string;
  table_id?: number;
  initial_state?: string;
  delta?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface ICashDeposit {
  id?: number;
  code: string;
  student_id: number;
  recorded_by: number;
  payer_id: number;
  school_id: number;
  currency: string; // Default: 'UGX'
  amount: number; // Default: 0
  class_id: number;
  period_id?: number;
  session_id: number;
  beneficiary_product_id: number;
  status: number;
  approval_status: number;
  notes?: string;
  description?: string;
  reciept_reference?: string;
  transaction_reference?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface ICashDepositLog {
  id?: number;
  code: string;
  cash_deposits_id: number;
  initiator_id: number;
  device_id: number;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  state_before: string;
  state_after: string;
  longitude?: string;
  latitude?: string;
  ip_address?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface IDevice {
  id: number;
  code: string;
  isMobile: boolean;
  os: string;
  name: string;
  model: string;
  deviceType: string;
  status: number;
  schoolId: number;
  ownerId: number;
}
