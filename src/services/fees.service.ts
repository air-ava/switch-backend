import Settings from './settings.service';
import { STATUSES } from '../database/models/status.model';
import { getClassLevel } from '../database/repositories/classLevel.repo';
import { getEducationPeriod } from '../database/repositories/education_period.repo';
import { listProductTypes, getProductType, saveProductType } from '../database/repositories/productType.repo';
import { getSchoolClass, listStundentsInSchoolClass } from '../database/repositories/schoolClass.repo';
import { getSchoolPeriod } from '../database/repositories/schoolPeriod.repo';
import { getSchoolProduct, listSchoolProduct, saveSchoolProduct } from '../database/repositories/schoolProduct.repo';
import { ExistsError, sendObjectResponse } from '../utils/errors';
import { ControllerResponse, theResponse } from '../utils/interface';
import NotFoundError from '../utils/notFounfError';
import ValidationError from '../utils/validationError';
import { generate } from 'randomstring';
import {
  saveBeneficiaryProductPayment,
  getBeneficiaryProductPayment,
  incrementAmountPaid,
  decrementAmountOutstanding,
} from '../database/repositories/beneficiaryProductPayment.repo';
import { SchoolProduct } from '../database/models/schoolProduct.model';
import { listStudent } from '../database/repositories/student.repo';
import { QueryRunner } from 'typeorm';
import { any } from 'joi';
import { IPaymentContacts, IStudentClass, IUser } from '../database/modelInterfaces';
import { saveALienTransaction } from '../database/repositories/lienTransaction.repo';
import { saveTransaction } from '../database/repositories/transaction.repo';
import { saveProductTransaction } from '../database/repositories/productTransaction.repo';
import { getSchoolSession } from '../database/repositories/schoolSession.repo';

const Service = {
  async getSchoolProduct(data: any): Promise<theResponse> {
    const { code } = data;
    const response = await getSchoolProduct({ code }, [], ['Period', 'Session', 'School', 'SchoolClass', 'ProductType', 'PaymentType']);
    if (!response) throw new NotFoundError('Fee');
    return sendObjectResponse('Fee retrieved successfully', response);
  },

  async listFeesInSchool(data: any): Promise<theResponse> {
    const { school, ...rest } = data;
    // todo: repo for sum of students and a sum of expected tuition fee
    const response = await listSchoolProduct(
      { school_id: school.id, ...rest },
      [],
      ['Period', 'Session', 'School', 'SchoolClass', 'ProductType', 'PaymentType'],
    );
    return sendObjectResponse('All Fees retrieved successfully', response);
  },

  async listFeeTypes(data: any): Promise<theResponse> {
    const { school, ...rest } = data;
    const response = await listProductTypes([{ school_id: school.id }, { school_id: null }], []);
    return sendObjectResponse('All Fee types retrieved successfully', response);
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
      forSession = false,
      expiresAtPeriodEnd = false,
      addClass = false,
      schoolClassCode,
    } = data;
    const paymentTypes = Settings.get('PAYMENT_TYPES');

    let foundClassLevel: any;
    if (classCode) {
      foundClassLevel = await getClassLevel({ code: classCode }, []);
      if (!foundClassLevel) throw new NotFoundError('Class Level');
      foundClassLevel = foundClassLevel.id;
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

    const sessionUse = forSession ? foundPeriod.Session.id || session.id : null;

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
    const { description, amount, currency, image, school, name, class: classCode } = data;
    const {
      data: { foundClassLevel, feature_name, paymentTypes, foundProductType, periodManagement, sessionUse, schoolClass },
    } = await Service.generateFeeData(data);

    const createdFee = await Service.findOrCreateASchoolProduct({
      name,
      paymentTypes,
      foundProductType,
      description,
      amount,
      ...periodManagement,
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

    return sendObjectResponse('Fee created successfully', createdFee.data);
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
      school_class_id: schoolClass.id || null,
      status,
      feature_name,
      ...periodManagement,
    };

    console.log({ findCriteria });

    const schoolProductCriteria = productCode ? { code: productCode } : findCriteria;
    let schoolProduct = await getSchoolProduct(schoolProductCriteria, []);
    if (schoolProduct) throw new ExistsError(`Fee for this school`);
    schoolProduct = await saveSchoolProduct({ description, amount, currency, image, ...findCriteria });

    // todo: Create a fee per student for the class and school
    const students = foundClassLevel
      ? (
          await listStundentsInSchoolClass(
            {
              schoolId: school.id,
              status: STATUSES.ACTIVE,
              classId: foundClassLevel,
            },
            [],
          )
        ).students
      : (await listStudent({ schoolId: school.id, status: STATUSES.ACTIVE }, [])).students;
    await Promise.all(
      students.map((student: any) =>
        saveBeneficiaryProductPayment({
          beneficiary_type,
          beneficiary_id: student.studentId ? student.studentId : student.id,
          product_id: (schoolProduct as SchoolProduct).id,
          amount_paid: 0,
          amount_outstanding: (schoolProduct as SchoolProduct).amount,
          product_currency: (schoolProduct as SchoolProduct).currency,
        }),
      ),
    );

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
      ['Fee', 'Student', 'Student.User', 'Student.School'],
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
    const { School } = productPayment.Student as any;
    const session = await getSchoolSession({ country: 'UGANDA' || School.country.toUpperCase(), status: STATUSES.ACTIVE }, []);
    // const studentCurrentClass = Classes && Classes.filter((value: IStudentClass) => value.status === STATUSES.ACTIVE);

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
      },
      t,
    );
    if (t) t.commitTransaction();
    return {
      success: true,
      message: 'Successfully recorded fee payment',
    };
  },

  // async recordFeePayment(data: any): Promise<theResponse> {
  //   const { paidAmount, beneficiaryProduct, transactionReference, payer, metadata } = data;

  //   // Update fee transaction
  //   // Save Product Transaction
  //   return sendObjectResponse('Fee Payment Created');
  // },
};
export default Service;
