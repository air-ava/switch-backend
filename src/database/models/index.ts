import { Addresses } from './address.model';
import { Assets } from './assets.model';
import { BackOfficeBanks } from './backOfficeBanks.model';
import { BackOfficeUsers } from './backOfficeUser.model';
import { BankTransfers } from './bankTransfer.model';
import { Banks } from './banks.model';
import { BeneficiaryProductPayment } from './beneficiaryProductPayment.model';
import { Business } from './business.model';
import { CardTransactions } from './cardTransaction.model';
import { Cards } from './cards.model';
import { Cart } from './cart.model';
import { CartProduct } from './cartProduct.model';
import { ClassLevel } from './class.model';
import { Currency } from './currencies.model';
import { CurrencyRate } from './currencyRate.model';
import { Documents } from './document.model';
import { DocumentRequirement } from './documentRequirement.model';
import { EducationLevel } from './education_level.model';
import { EducationPeriod } from './education_period.model';
import { Image } from './image.model';
import { Individual } from './individual.model';
import { JobTitle } from './jobTitle.model';
import { LienTransaction } from './lienTransaction.model';
import { Link } from './link.model';
import { MobileMoneyPayment } from './mobileMoneyPayment.model';
import { MobileMoneyTransactions } from './mobileMoneyTransactions.model';
import { Order } from './order.model';
import { Organisation } from './organisation.model';
import { Password } from './password.model';
import { PendingPayments } from './payment.model';
import { PaymentContacts } from './paymentContacts.model';
import { PaymentType } from './paymentType.model';
import { PhoneNumbers } from './phoneNumber.model';
import { Preference } from './preferences.model';
import { Product } from './product.model';
import { ProductCategory } from './productCategory.model';
import { ProductTransactions } from './productTransactions.model';
import { ProductType } from './productType.model';
import { Questionnaire } from './questionnaire.model';
import { QuestionnaireTitle } from './questionnaireTitle.model';
import { Questions } from './questions.model';
import { Schedule } from './schedule.model';
import { ScholarshipApplication } from './scholarshipApplication.model';
import { ScholarshipEligibility } from './scholarshipEligibility.model';
import { ScholarshipRequirement } from './scholarshipRequirement.model';
import { Schools } from './school.model';
import { SchoolClass } from './schoolClass.model';
import { SchoolPeriod } from './schoolPeriod.model';
import { SchoolProduct } from './schoolProduct.model';
import { SchoolSession } from './schoolSession.model';
import { Scholarship } from './schorlaship.model';
import { Settings } from './settings.model';
import { SettlementTransactions } from './settlementTransactions.model';

import { Social } from './social.model';
import { SponsorshipConditions } from './sponsorshipConditions.model';
import { Sponsorships } from './sponsorships.model';
import { Status } from './status.model';
import { Student } from './student.model';
import { StudentClass } from './studentClass.model';
import { StudentGuardian } from './studentGuardian.model';
import { ThirdPartyLogs } from './thirdParty.model';
import { Transactions } from './transaction.model';
import { Wallets } from './wallets.model';
import { Users } from './users.model';

const Models: any = {
  addresses: Addresses,
  assets: Assets,
  backOfficeBanks: BackOfficeBanks,
  backOfficeUsers: BackOfficeUsers,
  cardTransactions: CardTransactions,
  cards: Cards,
  cart: Cart,
  currency: Currency,
  currencyRate: CurrencyRate,
  cartProduct: CartProduct,
  classLevel: ClassLevel,
  documents: Documents,
  documentRequirement: DocumentRequirement,
  educationLevel: EducationLevel,
  educationPeriod: EducationPeriod,
  order: Order,
  image: Image,
  individual: Individual,
  bankTransfers: BankTransfers,
  banks: Banks,
  beneficiaryProductPayment: BeneficiaryProductPayment,
  business: Business,
  jobTitle: JobTitle,
  lienTransaction: LienTransaction,
  link: Link,
  mobileMoneyPayment: MobileMoneyPayment,
  mobileMoneyTransactions: MobileMoneyTransactions,
  organisation: Organisation,
  password: Password,
  payment: PendingPayments,
  paymentContacts: PaymentContacts,
  paymentType: PaymentType,
  phoneNumber: PhoneNumbers,
  preferences: Preference,
  product: Product,
  productCategory: ProductCategory,
  productTransactions: ProductTransactions,
  productType: ProductType,
  questionnaire: Questionnaire,
  questionnaireTitle: QuestionnaireTitle,
  questions: Questions,
  schedule: Schedule,
  scholarshipApplication: ScholarshipApplication,
  scholarshipEligibility: ScholarshipEligibility,
  scholarshipRequirement: ScholarshipRequirement,
  school: Schools,
  schoolClass: SchoolClass,
  schoolPeriod: SchoolPeriod,
  schoolProduct: SchoolProduct,
  schoolSession: SchoolSession,
  schorlaship: Scholarship,
  settings: Settings,
  settlementTransactions: SettlementTransactions,
  social: Social,
  sponsorshipConditions: SponsorshipConditions,
  sponsorships: Sponsorships,
  status: Status,
  student: Student,
  studentClass: StudentClass,
  studentGuardian: StudentGuardian,
  thirdParty: ThirdPartyLogs,
  transaction: Transactions,
  users: Users,
  wallets: Wallets,
};

export default Models;
