import { createObjectFromArrayWithoutValue, mapAnArray } from './../utils/utils';
import { generate } from 'randomstring';
import { Not, QueryRunner } from 'typeorm';
import { any } from 'joi';
import {
  getFeesByClass,
  // schoolFeesDetails,
  getSchoolClass,
  listFeesByClass,
  listSchoolClass,
  listStundentsInSchoolClass,
} from '../database/repositories/schoolClass.repo';
import Settings from './settings.service';
import { STATUSES } from '../database/models/status.model';
import { getClassLevel } from '../database/repositories/classLevel.repo';
import { getEducationPeriod } from '../database/repositories/education_period.repo';
import { listProductTypes, getProductType, saveProductType } from '../database/repositories/productType.repo';
import { getSchoolPeriod } from '../database/repositories/schoolPeriod.repo';
import {
  getSchoolProduct,
  listSchoolProduct,
  saveSchoolProduct,
  schoolFeesDetails,
  updateSchoolProduct,
} from '../database/repositories/schoolProduct.repo';
import { CustomError, ExistsError, HttpStatus, sendObjectResponse } from '../utils/errors';
import { ControllerResponse, theResponse } from '../utils/interface';
import NotFoundError from '../utils/notFounfError';
import ValidationError from '../utils/validationError';
import {
  saveBeneficiaryProductPayment,
  getBeneficiaryProductPayment,
  incrementAmountPaid,
  decrementAmountOutstanding,
  increaseOutstandingAmount,
} from '../database/repositories/beneficiaryProductPayment.repo';
import { SchoolProduct } from '../database/models/schoolProduct.model';
import { listStudent } from '../database/repositories/student.repo';
import { IPaymentContacts, IStudentClass, IUser } from '../database/modelInterfaces';
import { saveALienTransaction } from '../database/repositories/lienTransaction.repo';
import { saveTransaction } from '../database/repositories/transaction.repo';
import { saveProductTransaction } from '../database/repositories/productTransaction.repo';
import { getSchoolSession } from '../database/repositories/schoolSession.repo';
import { Sanitizer } from '../utils/sanitizer';
import Utils from '../utils/utils';
import { listStudentClass } from '../database/repositories/studentClass.repo';
import AuditLogsService from './auditLogs.service';
import { CURRENCIES } from '../database/models/currencies.model';
import { publishMessage } from '../utils/amqpProducer';

const Service: any = {
  async getSchoolProduct(data: any): Promise<theResponse> {
    const { code } = data;
    const response = await getSchoolProduct({ code }, [], ['Period', 'Session', 'School', 'SchoolClass', 'ProductType', 'PaymentType']);
    if (!response) throw new NotFoundError('Fee');
    return sendObjectResponse('Fee retrieved successfully', response);
  },

  async isFeeForSchool(data: any): Promise<theResponse> {
    const { school, item } = data;
    let { code } = data;
    if (!code && item) code = item;
    const fee = await getSchoolProduct({ code, status: Not(STATUSES.DELETED) }, [], ['FeesPaymentRecords', 'FeesPaymentRecords.FeesHistory']);
    if (!fee) throw new NotFoundError('Fee');
    if (fee.school_id !== school.id) throw new ValidationError('You do not have access to this fee');

    return sendObjectResponse('Fee belongs to school', fee);
  },

  async deleteFee(data: any): Promise<theResponse> {
    const { feeCheck = false } = data;

    const { success, data: fee } = feeCheck ? await Service.isFeeInUse(data) : await Service.isFeeForSchool(data);

    await updateSchoolProduct({ id: fee.id }, { status: STATUSES.DELETED });
    return sendObjectResponse('Fee deleted successfully');
  },

  async editFee(data: any): Promise<theResponse> {
    const { data: fee } = await Service.isFeeInUse(data);
    const { currency, classCode, status, name, description, amount, feeType, paymentType, periodCode } = data;

    const feePayload: any = {};
    if (status) feePayload.status = STATUSES[status.toUpperCase() as 'INACTIVE' | 'ACTIVE'];
    if (name) feePayload.name = name;
    if (description) feePayload.description = description;
    if (amount) feePayload.amount = amount;
    if (currency) feePayload.currency = currency;
    if (classCode) {
      const schoolClass = await getSchoolClass({ code: classCode }, []);
      if (!schoolClass) throw new NotFoundError('Class For School');
      feePayload.school_class_id = schoolClass.id;
    }
    if (feeType) {
      const foundProductType = await getProductType({ code: feeType }, []);
      if (!foundProductType) throw new NotFoundError(`Fee type`);
      const feature_name = foundProductType.slug === 'tuition' ? Settings.get('SCHOOL_PRODUCT').tuition : Settings.get('SCHOOL_PRODUCT').product;
      feePayload.feature_name = feature_name;
      feePayload.product_type_id = foundProductType.id;
    }
    if (paymentType) {
      const paymentTypes = Settings.get('PAYMENT_TYPES');
      feePayload.payment_type_id = paymentTypes[paymentType];
    }
    if (periodCode) {
      const eduPeriod: any = await getEducationPeriod({ code: periodCode }, []);
      feePayload.period = eduPeriod.id;
    }

    await updateSchoolProduct({ id: fee.id }, feePayload);
    if (amount) await increaseOutstandingAmount({ product_id: fee.id }, amount - fee.amount);
    return sendObjectResponse('Fee edited successfully');
  },

  async isFeeInUse(data: any): Promise<theResponse> {
    const { success, data: fee } = await Service.isFeeForSchool(data);

    const feeTransactions = mapAnArray(fee.FeesPaymentRecords, 'FeesHistory');
    const cleanFeeTransactions = (feeTransactions as any).flat();
    if (cleanFeeTransactions.length) throw new CustomError(`Fee ${fee.name ? `(${fee.name}) ` : ''}is currently in use`, HttpStatus.BAD_REQUEST, fee);

    return sendObjectResponse('Fee is not in use', fee);
  },

  async deleteFees(data: any): Promise<theResponse> {
    const { feeCodes, school } = data;
    await Service.callService('deleteFee', feeCodes, { school, feeCheck: true });
    return sendObjectResponse('Fees deleted successfully');
  },

  async listFeesInSchool(data: any): Promise<theResponse> {
    const { school, ...rest } = data;
    const response = await listSchoolProduct(
      { school_id: school.id, ...rest },
      [],
      ['Period', 'Session', 'School', 'SchoolClass', 'ProductType', 'PaymentType'],
    );
    return sendObjectResponse('All Fees retrieved successfully', response);
  },

  async listFeeTypes(data: any): Promise<theResponse> {
    const { school, ...rest } = data;
    const response = await listProductTypes(
      [
        { school_id: school.id, status: STATUSES.ACTIVE },
        { school_id: null, status: STATUSES.ACTIVE },
      ],
      [],
    );
    return sendObjectResponse('All Fee types retrieved successfully', response);
  },

  async queueFeeForStudent(data: any) {
    const { student, classFee, ...item } = data;
    let incomingStudent = student;
    if (!student) incomingStudent = item;

    incomingStudent.id = incomingStudent.studentId ? incomingStudent.studentId : incomingStudent.id;
    publishMessage('create:student:fees', { student: incomingStudent, classFee });
  },

  async createAFeeType(data: any): Promise<theResponse> {
    const { school, name, ...rest } = data;
    const slug = name.toLowerCase();
    let response: any;
    response = await getProductType({ slug, status: STATUSES.ACTIVE }, []);
    if (!response) response = await saveProductType({ school_id: school.id, name, slug, ...rest });
    return sendObjectResponse('Fee type created successfully', response);
  },

  async generateFeeData(data: any): Promise<theResponse> {
    const {
      class: classCode,
      eduPeriodCode,
      periodCode,
      paymentType = 'install-mental',
      feeType = 'tuition',
      session,
      school,
      forPeriod = false,
      forSession = true,
      expiresAtPeriodEnd = false,
      addClass = false,
    } = data;
    let { schoolClassCode } = data;
    const paymentTypes = Settings.get('PAYMENT_TYPES');

    let foundClassLevel: any;
    if (classCode) {
      if (classCode.includes('shc_') && !schoolClassCode) {
        schoolClassCode = classCode;
        const schoolClass = await getSchoolClass({ code: schoolClassCode }, [], ['ClassLevel']);
        if (!schoolClass) throw new NotFoundError('Class For School');
        foundClassLevel = schoolClass.ClassLevel.id;
      }
      if (!foundClassLevel) {
        foundClassLevel = await getClassLevel({ code: classCode }, []);
        if (!foundClassLevel) throw new NotFoundError('Class Level');
        foundClassLevel = foundClassLevel.id;
      }
    }

    const feeTypeCriteria = feeType.includes('prt_') ? { code: feeType } : { slug: feeType.toLowerCase() };
    const foundProductType = await getProductType(feeTypeCriteria, []);
    if (!foundProductType) throw new NotFoundError(`Fee type`);

    const feature_name = foundProductType.slug === 'tuition' ? Settings.get('SCHOOL_PRODUCT').tuition : Settings.get('SCHOOL_PRODUCT').product;

    let periodManagement: { school_period?: number; period?: number } = {};
    let foundPeriod: any;
    let eduPeriod: any;
    if (forPeriod) {
      if (!periodCode && !eduPeriodCode) throw new ValidationError('No Period Code is giving');
      if (periodCode && eduPeriodCode) throw new ValidationError('Only one type of period code can be giving');
      // find the Periods - [ACTIVE] -  in the map
      if (eduPeriodCode) {
        foundPeriod = await getSchoolPeriod({ code: eduPeriodCode }, [], ['Session', 'Period']);
        if (!foundPeriod) throw new NotFoundError('Period');
        if (foundPeriod.status !== STATUSES.ACTIVE) throw new ValidationError('Period not active');
        // find the Session - [ACTIVE]
        if (foundPeriod.Session.status !== STATUSES.ACTIVE) throw new ValidationError('Session not active');
      }
      if (periodCode) eduPeriod = await getEducationPeriod({ code: periodCode }, []);
      periodManagement = expiresAtPeriodEnd ? { school_period: foundPeriod.id } : { period: eduPeriod.id };
    }

    let sessionUse;
    if (forSession || forPeriod) sessionUse = session.id;
    if (forPeriod && foundPeriod) sessionUse = foundPeriod.Session.id;

    let schoolClass: any;
    if (classCode || schoolClassCode) {
      const schoolClassCriteria = schoolClassCode
        ? { code: schoolClassCode }
        : { school_id: school.id, class_id: foundClassLevel, status: STATUSES.ACTIVE };
      schoolClass = await getSchoolClass(schoolClassCriteria, []);
      if (!schoolClass && !addClass) throw new NotFoundError(`Class for this School`);
      if (!addClass) schoolClass = schoolClass.id;
    }

    return sendObjectResponse('Fee type created successfully', {
      paymentTypes: paymentTypes[paymentType],
      foundProductType,
      periodManagement,
      sessionUse,
      schoolClass,
      feature_name,
      foundClassLevel,
    });
  },

  async createAFee(data: any): Promise<theResponse> {
    const { admin, description, amount, currency, image, school, name, class: classCode, authSession, session } = data;
    if (session) {
      const foundSession = await getSchoolSession({ code: session }, []);
      if (!foundSession || foundSession.status === STATUSES.DELETED) throw new NotFoundError('session');
      // eslint-disable-next-line no-param-reassign
      data.session = foundSession;
      // eslint-disable-next-line no-param-reassign
    } else data.session = authSession;
    const {
      data: { foundClassLevel, feature_name, paymentTypes, foundProductType, periodManagement, sessionUse, schoolClass },
    } = await Service.generateFeeData(data);

    const createdFee = await Service.findOrCreateASchoolProduct({
      name,
      paymentTypes,
      foundProductType,
      description,
      amount,
      periodManagement,
      sessionUse,
      school,
      schoolClass,
      currency,
      image,
      feature_name,
      status: STATUSES.ACTIVE,
      ...(classCode && { foundClassLevel }),
      beneficiary_type: 'student',
    });

    if (admin) {
      const newFee = createdFee.data;
      await AuditLogsService.createLog({
        event: 'add-fee-to-school',
        user_type: 'backOfficeUsers',
        user: admin.id,
        delta: JSON.stringify(newFee),
        table_type: 'schoolProduct',
        table_id: newFee.id,
      });
    }
    return sendObjectResponse('Fee created successfully', createdFee.data);
  },

  async runService(service: string, item: any, supportData: any) {
    return Service[service]({
      ...(typeof item === 'object' ? { ...Sanitizer.jsonify(item) } : { item }),
      ...supportData,
    });
  },

  async callService(service: string, payload: any, supportData: any): Promise<any> {
    if (payload.length) {
      return Promise.all(payload.map((item: any) => Service.runService(service, item, supportData)));
    }
    return Service.runService(service, payload, supportData);
  },

  async createFees(data: any): Promise<theResponse> {
    const { incomigFees, school, authSession, session, ...rest } = data;
    await Service.callService('createAFee', incomigFees, { school, session, authSession, ...rest });
    return sendObjectResponse('Fees created successfully');
  },

  async findOrCreateASchoolProduct(data: any): Promise<theResponse> {
    const {
      paymentTypes,
      foundProductType,
      description,
      amount,
      periodManagement,
      sessionUse,
      school,
      name,
      schoolClass,
      currency,
      image,
      feature_name,
      status = STATUSES.ACTIVE,
      code: productCode,
      foundClassLevel,
      beneficiary_type = 'student',
    } = data;

    const findCriteria = {
      payment_type_id: paymentTypes,
      product_type_id: foundProductType.id,
      session: sessionUse || null,
      school_id: school.id,
      school_class_id: schoolClass && schoolClass.id ? schoolClass.id : schoolClass || null,
      status,
      feature_name,
      name,
      ...periodManagement,
    };

    const schoolProductCriteria = productCode ? { code: productCode } : findCriteria;
    let schoolProduct = await getSchoolProduct(schoolProductCriteria, []);
    if (schoolProduct) throw new ExistsError(`Fee for this school`);
    schoolProduct = await saveSchoolProduct({ description, amount, currency, image, ...findCriteria });

    const students = foundClassLevel
      ? (
          await listStundentsInSchoolClass(
            {
              schoolId: school.id,
              status: STATUSES.ACTIVE,
              classId: foundClassLevel,
              currency: CURRENCIES[school.country.toUpperCase()],
            },
            [],
            ['student.Fees', 'student.Fees.Fee', 'student.User', 'student.Fees.FeesHistory'],
          )
        ).students
      : (await listStudent({ schoolId: school.id, status: STATUSES.ACTIVE }, [])).students;

    if (students.length) await Service.callService('queueFeeForStudent', students, { classFee: schoolProduct });

    return sendObjectResponse('Fee created successfully', schoolProduct);
  },

  async createFeePaymentStatus(data: any): Promise<theResponse> {
    const { beneficiaryType = 'student', beneficiaryId, product, amount_paid = 0 } = data;
    const { amount, id: productId } = product;
    await saveBeneficiaryProductPayment({ beneficiaryType, beneficiaryId, productId, amount_paid, amount_outstanding: amount });
    return sendObjectResponse('Fee Payment Created');
  },

  async recordInstallment({
    amount,
    reference,
    paymentContact,
    metadata,
    beneficiaryId,
    status = STATUSES.SUCCESS,
    t,
  }: {
    amount: number;
    paymentContact: IPaymentContacts;
    beneficiaryId: number;
    status?: number;
    reference: string;
    metadata: { [key: string]: number | string };
    t?: QueryRunner;
  }): Promise<ControllerResponse> {
    const productPayment = await getBeneficiaryProductPayment(
      { id: beneficiaryId },
      [],
      ['Fee', 'Student', 'Student.User', 'Student.School', 'Student.Classes'],
    );
    // const wallet = await WalletREPO.findWallet({ userId: user.id, id: walletId }, ['id', 'balance', 'ledger_balance'], t);
    if (!productPayment) {
      return {
        success: false,
        error: 'Fee does not exist for beneficiary',
      };
    }
    if (!productPayment.Student || !(productPayment.Student as any).User) {
      return {
        success: false,
        error: 'Beneficiary does not exist',
      };
    }
    const { School, Classes } = productPayment.Student as any;
    const session = await getSchoolSession({ country: 'UGANDA' || School.country.toUpperCase(), status: STATUSES.ACTIVE }, []);
    const [studentCurrentClass] = Classes && Classes.filter((value: IStudentClass) => value.status === STATUSES.ACTIVE);

    await incrementAmountPaid(productPayment.id, amount, t);
    await decrementAmountOutstanding(productPayment.id, amount, t);
    // Payment Contact || Beneficiary User
    await saveProductTransaction(
      {
        amount,
        status,
        payer: paymentContact.id,
        outstanding_before: Number(productPayment.amount_outstanding),
        outstanding_after: Number(productPayment.amount_outstanding) - Number(amount),
        metadata,
        beneficiary_product_payment_id: productPayment,
        tx_reference: reference,
        session: session && session.session,
        student_class: studentCurrentClass && studentCurrentClass.id,
      },
      t,
    );
    if (t) t.commitTransaction();
    return {
      success: true,
      message: 'Successfully recorded fee payment',
    };
  },

  async listClassFee(data: any): Promise<theResponse> {
    const { school, perPage, page, from, to } = data;
    const { currency = CURRENCIES[school.country.toUpperCase()] } = data;

    const response = await listFeesByClass(
      { status: STATUSES.ACTIVE, currency, school_id: school.id, perPage, page, from, to },
      [],
      ['Fees', 'ClassLevel', 'Fees.PaymentType', 'Fees.ProductType', 'Fees.Session'],
    );
    return sendObjectResponse('Fees retrieved successfully', response);
  },

  async getFeesInClass(data: any): Promise<theResponse> {
    const { code, school, ...rest } = data;
    const { currency = CURRENCIES[school.country.toUpperCase()] } = data;

    const foundClassLevel = await getClassLevel({ code }, []);
    if (!foundClassLevel) throw new NotFoundError('Class Level');

    const response = await getFeesByClass(
      { status: Not(STATUSES.DELETED), currency, class_id: foundClassLevel.id, school_id: school.id },
      [],
      ['Fees', 'ClassLevel', 'Fees.PaymentType', 'Fees.ProductType', 'Fees.Session', 'Fees.Period', 'Fees.SchoolClass'],
    );

    const groupedTransactions = createObjectFromArrayWithoutValue(
      Sanitizer.sanitizeAllArray(response.Fees, Sanitizer.sanitizeFee),
      'session.session',
    );
    return sendObjectResponse('Class Fees retrieved successfully', groupedTransactions);
  },

  async feesDetails(data: any): Promise<theResponse> {
    const { school } = data;

    const response = await schoolFeesDetails({ schoolId: school.id });
    return sendObjectResponse('Fee details retrieved', response);
  },
};
export default Service;
