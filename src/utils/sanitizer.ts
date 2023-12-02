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
import { countryMapping } from '../database/models/users.model';
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

  mapAnArray(arr: any[], key: string) {
    return arr.map((item) => {
      const response = Sanitizer.jsonify(item);
      return key.includes('.') ? Sanitizer.findObjectValue(response, key) : response[key];
    });
  },

  findObjectValue(object: any, path: string) {
    const args = path.split('.');
    let sanitizedObject = Sanitizer.jsonify(object);
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < args.length; index++) {
      // eslint-disable-next-line no-prototype-builtins
      if (!sanitizedObject.hasOwnProperty(args[index])) return;
      sanitizedObject = sanitizedObject[args[index]];
    }
    // eslint-disable-next-line consistent-return
    return sanitizedObject;
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
      status,
      JobTitle,
      job_title,
      email,
      ...rest
    } = Sanitizer.jsonify(payload);

    const sanitized = {
      ...rest,
      reference: slug,
      ...(School && { schoolOnboardingStatus: Sanitizer.getStatusById(STATUSES, School.status).toLowerCase() }),
      avatar: Avatar && Sanitizer.sanitizeAsset(Avatar),
      address: Address && Sanitizer.sanitizeAddress(Address),
      job_title: JobTitle ? JobTitle.name : job_title,
      emailVerified: !!email_verified_at,
      email_verified_at,
      userVerified: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      ...(phoneNumber && { phone_number: phoneNumber.internationalFormat }),
      phoneNumber: Sanitizer.sanitizePhoneNumber(phoneNumber),
      email: Sanitizer.sanitizeEmail(email),
      school: School && Sanitizer.sanitizeSchool(School),
      organisation: Organisation && Sanitizer.sanitizeOrganization(Organisation),
      wallet: Wallet && Sanitizer.sanitizeWallet(Wallet),
    };
    return sanitized;
  },

  sanitizeAdminUser(payload: IUser): any {
    if (!payload) return null;
    const { status, password, remember_token, email_verified_at, Avatar, slug, ...rest } = Sanitizer.jsonify(payload);

    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      reference: slug,
      avatar: Avatar && Sanitizer.sanitizeAsset(Avatar),
      emailVerified: !!email_verified_at,
      email_verified_at,
    };
    return sanitized;
  },

  sanitizeAdmin(payload: any): any {
    if (!payload) return null;
    const { id, ...rest } = Sanitizer.sanitizeAdminUser(payload);

    const sanitized = { ...rest };
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

  sanitizeNoId(payload: ISponsorships): any {
    if (!payload) return null;
    const { id, status, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
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

  sanitizeWallet(payload: IScholarshipApplication, addUserId?: boolean): any {
    if (!payload) return null;
    const { id, userId, User, status, transaction_pin, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      id,
      isPinSet: !!transaction_pin,
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      ...(addUserId && { userId }),
      owner: User && Sanitizer.sanitizeUser(User),
    };
    return sanitized;
  },

  async sanitizeTransactions(payload: any): Promise<any> {
    if (!Array.isArray(payload)) return [];
    const response = await Promise.all(payload.map(Sanitizer.sanitizeTransaction));
    return response;
  },

  async sanitizeTransaction(payload: any): Promise<any> {
    if (!payload) return null;
    const { amount, id, userId, User, status, Wallet, walletId, document_reference, Reciepts, metadata, ...rest } = Sanitizer.jsonify(payload);
    let Student;
    if (metadata && metadata.collectRequestId && String(metadata.username).length > 7) {
      Student = await getStudent({ uniqueStudentId: metadata.username }, [], ['User', 'Classes', 'Classes.ClassLevel']);
    }

    const { transactionFees = 0, charges = 0 } = metadata || {};
    const sanitized = {
      id,
      ...rest,
      amount: amount - (charges || transactionFees || 0),
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
    const { id, StudentGuardians, status, User, paymentTypeId, userId, School, schoolId, Fees, uniqueStudentId, Classes, PaymentType, ...rest } =
      Sanitizer.jsonify(payload);
    const studentCurrentClass = Classes && Classes.filter((value: IStudentClass) => value.status === STATUSES.ACTIVE);
    const paymentFees = Fees && Sanitizer.mapAnArray(Fees, 'FeesHistory');
    const sanitized = {
      id,
      ...rest,
      partPayment: PaymentType && PaymentType.value === 'install-mental' ? PaymentType.value === 'install-mental' : false,
      blockPayment: PaymentType && PaymentType.value === 'no-payment' ? PaymentType.value === 'no-payment' : false,
      studentId: uniqueStudentId,
      status:
        status &&
        (Sanitizer.getStatusById(STATUSES, status).toLowerCase() === 'deleted'
          ? 'deactivated'
          : Sanitizer.getStatusById(STATUSES, status).toLowerCase()),
      user: User && Sanitizer.sanitizeUser(User),
      school: School && Sanitizer.sanitizeSchool(School),
      class: Classes && studentCurrentClass[0].ClassLevel,
      session: Classes && studentCurrentClass[0].Session,
      classHistory: Classes && Sanitizer.sanitizeAllArray(Classes, Sanitizer.sanitizeStudentClass),
      fees: Fees && Sanitizer.sanitizeAllArray(Fees, Sanitizer.sanitizeBeneficiaryFee),
      paymentHistory: Fees && Sanitizer.sanitizeAllArray(paymentFees.flat(), Sanitizer.sanitizePaymentHistory),
      paymentType: PaymentType && Sanitizer.sanitizePaymentType(PaymentType),
      studentGuardians: StudentGuardians && Sanitizer.sanitizeAllArray(StudentGuardians, Sanitizer.sanitizeStudentGuardian),
    };
    return sanitized;
  },

  sanitizeStudentInClass(payload: any): any {
    if (!payload) return null;
    const { id, class: classLevel, students, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      class: classLevel && Sanitizer.sanitizeClassLevel(classLevel),
      students: students && Sanitizer.sanitizeAllArray(students, Sanitizer.sanitizeStudentClass),
    };
    return sanitized;
  },

  sanitizeClassLevel(payload: any): any {
    if (!payload) return null;
    const { id, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
    };
    return sanitized;
  },

  sanitizeEducationLevel(payload: any): any {
    if (!payload) return null;
    const { id, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
    };
    return sanitized;
  },

  sanitizeSchoolClass(payload: any): any {
    if (!payload) return null;
    const { id, class_id, status, school_id, ClassLevel, Fees, School, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      classLevel: ClassLevel && Sanitizer.sanitizeClassLevel(ClassLevel),
      school: School && Sanitizer.sanitizeClassLevel(School),
      classFees: Fees && Sanitizer.sanitizeAllArray(Fees, Sanitizer.sanitizeFee),
    };
    return sanitized;
  },

  sanitizeBeneficiaryFee(payload: any): any {
    if (!payload) return null;
    const { id, Fee, FeesHistory, status, Student, product_id, is_default_amount, custom_amount, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      is_default_amount,
      custom_amount,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      feeHistory: FeesHistory && Sanitizer.sanitizeAllArray(FeesHistory, Sanitizer.sanitizeFee),
      fee: Fee && Sanitizer.sanitizeFee(Fee, !is_default_amount && custom_amount),
      student: Student && Sanitizer.sanitizeStudent(Student),
    };
    return sanitized;
  },
  sanitizeCashDepositLog(payload: any): any {
    if (!payload) return null;
    const { id, initiator_id, User, state_before, status, state_after, device_id, Device, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      initiatedBy: User && Sanitizer.sanitizeUser(User),
      device: Device && Sanitizer.sanitizeNoId(Device),
    };
    return sanitized;
  },
  sanitizeCashDeposit(payload: any): any {
    if (!payload) return null;
    const {
      id,
      StudentFee,
      status,
      approval_status,
      User,
      Student,
      Payer,
      beneficiary_product_id,
      school_id,
      payer_id,
      student_id,
      class_id,
      session_id,
      recorded_by,
      Reciepts,
      Transactions,
      CashDepositLogs,
      Period,
      ClassLevel,
      period_id,
      ...rest
    } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      approvalStatus: approval_status && Sanitizer.getStatusById(STATUSES, approval_status).toLowerCase(),
      classLevel: ClassLevel && Sanitizer.sanitizeClassLevel(ClassLevel),
      period: Period && Sanitizer.sanitizePeriod(Period),
      payer: Payer && Sanitizer.sanitizePaymentContact(Payer),
      fee: StudentFee && Sanitizer.sanitizeBeneficiaryFee(StudentFee),
      student: Student && Sanitizer.sanitizeStudent(Student),
      recordedBy: User && Sanitizer.sanitizeUser(User),
      reciepts: Reciepts && Sanitizer.sanitizeAllArray(Reciepts, Sanitizer.sanitizeAsset),
      transactions: Transactions && Sanitizer.sanitizeAllArray(Transactions, Sanitizer.sanitizeTransaction),
      logs: CashDepositLogs && Sanitizer.sanitizeAllArray(CashDepositLogs, Sanitizer.sanitizeCashDepositLog),
    };
    return sanitized;
  },

  sanitizeFee(payload: any, customAmount?: any): any {
    if (!payload) return null;
    const {
      id,
      Period,
      Session,
      School,
      SchoolClass,
      ProductType,
      PaymentType,
      school_id,
      school_class_id,
      status,
      payment_type_id,
      product_type_id,
      Transactions,
      amount,
      ...rest
    } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      amount: customAmount || amount,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      feeType: ProductType && Sanitizer.sanitizeFeeType(ProductType),
      paymentType: PaymentType && Sanitizer.sanitizePaymentType(PaymentType),
      period: Period && Sanitizer.sanitizePeriod(Period),
      session: Session && Sanitizer.sanitizeSession(Session),
      schoolClass: SchoolClass && Sanitizer.sanitizeSchoolClass(SchoolClass),
      school: School && Sanitizer.sanitizeSchool(School),
    };
    return sanitized;
  },

  sanitizeByClass(payload: any): any {
    if (!payload) return null;
    const { id, Fees, status, class_id, school_id, ClassLevel, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      class: ClassLevel && Sanitizer.sanitizeClassLevel(ClassLevel),
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      fee: Fees && Sanitizer.sanitizeAllArray(Fees, Sanitizer.sanitizeFee),
    };
    return sanitized;
  },

  sanitizePaymentHistory(payload: any): any {
    if (!payload) return null;
    const { id, payer, status, Payer, beneficiaryFee, beneficiary_product_payment_id, Transactions, ...rest } = Sanitizer.jsonify(payload);
    const [paymentTransaction] = Transactions ? Transactions.filter((value: any) => !value.purpose.includes('Fees:')) : [];
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      transaction: Transactions && Sanitizer.sanitizeLightTransaction(paymentTransaction),
      channel: Transactions && paymentTransaction.channel,
      currency: beneficiaryFee && beneficiaryFee.product_currency,
      payer: Payer && Sanitizer.sanitizePaymentContact(Payer),
      // transactions: Transactions && Sanitizer.sanitizeLightTransaction(Transactions),
    };
    return sanitized;
  },

  sanitizePaymentContact(payload: any): any {
    if (!payload) return null;
    const { id, status, school, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
    return sanitized;
  },

  sanitizeFeeType(payload: any): any {
    if (!payload) return null;
    const { id, slug, status, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
    return sanitized;
  },

  sanitizePaymentType(payload: any): any {
    if (!payload) return null;
    const { id, slug, status, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
    return sanitized;
  },

  sanitizePeriod(payload: any): any {
    if (!payload) return null;
    const { id, feature_name, Schedule, school_id, schedule_id, session_id, Session, status, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      schedule: Schedule && Sanitizer.sanitizeSchedule(Schedule),
      session: Session && Sanitizer.sanitizeSession(Session),
    };
    return sanitized;
  },

  sanitizeSchedule(payload: any): any {
    if (!payload) return null;
    const { id, cron_id, cron_expression, status, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
    return sanitized;
  },

  sanitizeSession(payload: any): any {
    if (!payload) return null;
    const { id, schedule_id, Schedule, status, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      schedule: Schedule && Sanitizer.sanitizeSchedule(Schedule),
    };
    return sanitized;
  },

  sanitizeStudentGuardian(payload: IScholarshipApplication): any {
    if (!payload) return null;
    const { id, status, verification_status, Guardian, School, individualId, Student, studentId, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      verification_status: verification_status && Sanitizer.getStatusById(STATUSES, verification_status).toLowerCase(),
      student: Student && Sanitizer.sanitizeStudent(Student),
      guardian: Guardian && Sanitizer.sanitizeIndividual(Guardian),
      school: School && Sanitizer.sanitizeSchool(School),
    };
    return sanitized;
  },

  sanitizeIndividual(payload: IScholarshipApplication): any {
    if (!payload) return null;
    const { id, status, verification_status, school_id, phoneNumber, phone_number, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      id,
      ...rest,
      phoneNumber: Sanitizer.sanitizePhoneNumber(phoneNumber),
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      verification_status: verification_status && Sanitizer.getStatusById(STATUSES, verification_status).toLowerCase(),
    };
    return sanitized;
  },

  sanitizeStudentClass(payload: IScholarshipApplication): any {
    if (!payload) return null;
    const { id, status, ClassLevel, classId, Student, student, studentId, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      id,
      ...rest,
      // paymentStatus:
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      student: (Student || student) && Sanitizer.sanitizeStudent(Student || student),
      classLevel: ClassLevel && Sanitizer.sanitizeSchool(ClassLevel),
    };
    return sanitized;
  },

  sanitizeDashboardStats(payload: IScholarshipApplication): any {
    if (!payload) return null;
    const { totalIn, totalOut, totalCharges, ...rest } = Sanitizer.jsonify(payload);
    const sanitized = {
      ...rest,
      totalIn: totalIn - totalCharges || '0',
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
    const { id, is_verified, verified_at, remember_token, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      id,
      phoneVerified: is_verified,
      phone_verified_at: verified_at,
    };
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

  sanitizeAddress(payload: IAssets, shortenCountry?: boolean): any {
    if (!payload) return null;
    const { status, country, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      country: shortenCountry ? Sanitizer.getStatusById(countryMapping, country) : country,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
  },

  sanitizeOrganization(payload: IAssets): any {
    if (!payload) return null;
    const { status, Owner, email, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      email: Sanitizer.sanitizeEmail(email),
      owner: Owner && Sanitizer.sanitizeUser(Owner),
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
  },

  sanitizeSchool(payload: any): any {
    if (!payload) return null;

    const {
      owner,
      country,
      education_level,
      email,
      status,
      organisation_id,
      phone_number,
      address_id,
      Address,
      phoneNumber,
      Organisation,
      Logo,
      ...rest
    } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      email: Sanitizer.sanitizeEmail(email),
      country: country ? Sanitizer.getStatusById(countryMapping, country) : country,
      education_level: education_level ? education_level.split(',') : [],
      address: Address && Sanitizer.sanitizeAddress(Address, true),
      phoneNumber: phoneNumber && Sanitizer.sanitizePhoneNumber(phoneNumber),
      organisation: Organisation && Sanitizer.sanitizeOrganization(Organisation),
      logo: Logo && Sanitizer.sanitizeAsset(Logo),
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      owner: owner && Sanitizer.sanitizeIndividual(owner),
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

  sanitizeEmail(email: string): any {
    if (!email) return null;
    return email.includes('steward.com') ? null : email;
  },

  sanitizeBankTransfer(payload: any): any {
    if (!payload) return null;
    const { status, bankId, Bank, Wallet, walletId, Transactions, Assets, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
      bank: Bank && Sanitizer.sanitizeBank(Bank),
      assets: Assets && Sanitizer.sanitizeAsset(Assets),
      wallet: Wallet && Sanitizer.sanitizeWallet(Wallet, true),
      transactions: Transactions && Sanitizer.sanitizeAllArray(Transactions, Sanitizer.sanitizeTransaction),
    };
  },

  sanitizeBankName(payload: any): any {
    if (!payload) return null;
    const { name, ...rest } = Sanitizer.jsonify(payload);
    return name;
  },

  filterTransactionsByPurpose(transactions: ITransactions[], purpose: string): any {
    const filteredTransaction = transactions.filter((transaction) => transaction.purpose.includes(purpose));
    return filteredTransaction[0];
  },

  sanitizeDocument(payload: any): any {
    if (!payload) return null;
    const { Asset, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      Assets: Asset && [Asset],
    };
  },

  sanitizeDocumentRequirement(payload: any): any {
    if (!payload) return null;
    const { Asset, status, ...rest } = Sanitizer.jsonify(payload);
    return {
      ...rest,
      status: status && Sanitizer.getStatusById(STATUSES, status).toLowerCase(),
    };
  },

  sanitizeSettlement(payload: any): any {
    if (!payload) return null;
    const { bankId, status, processor_transaction_id, Transactions, creditTransactions, Bank, ...rest } = Sanitizer.jsonify(payload);
    const Transaction = Sanitizer.filterTransactionsByPurpose(Transactions, 'Withdraw:Settlement');
    return {
      ...rest,
      currency: Transactions && Transactions[0].Wallet && Transactions[0].Wallet.currency,
      payment: Transaction && Sanitizer.sanitizeLightTransaction(Transaction),
      bank: Bank && Sanitizer.sanitizeBank(Bank),
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
  const { id, remember_token, ...rest } = jsonify(payload);
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
