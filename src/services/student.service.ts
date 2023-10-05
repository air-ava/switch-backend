/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable array-callback-return */
/* eslint-disable lines-between-class-members */
import randomstring from 'randomstring';
// import { StudentGuardian } from './../database/models/studentGuardian.model';
import * as bcrypt from 'bcrypt';
import { In, IsNull, Like, Not } from 'typeorm';
import Utils, { createObjectFromArrayWithoutValue, mapAnArray } from '../utils/utils';
import { ISchoolProduct, IStudentClass } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { PAYMENT_TYPE } from '../database/models/paymentType.model';
import { getClassLevel, listClassLevel } from '../database/repositories/classLevel.repo';
import { HttpStatus, CustomError, sendObjectResponse, ExistsError, NotFoundError, ValidationError } from '../utils/errors';
import {
  findUser,
  // getSearchUsers,
  listUser,
  saveAUser,
  updateUser,
} from '../database/repositories/user.repo';
import { theResponse } from '../utils/interface';
import { getStudent, listStudent, saveStudentREPO, updateStudent } from '../database/repositories/student.repo';
import { getStudentClass, saveStudentClassREPO, updateStudentClass } from '../database/repositories/studentClass.repo';
import Settings from './settings.service';
import { findOrCreateIndividual, updateIndividual } from '../database/repositories/individual.repo';
import { listStudentGuardian, saveStudentGuardianREPO, updateStudentGuardian } from '../database/repositories/studentGuardian.repo';
import { findOrCreatePhoneNumber } from './helper.service';
import FeesService from './fees.service';
import {
  getClassAnalytics,
  getSchoolClass,
  getSchoolClassDetails,
  listSchoolClass,
  listStundentsInSchoolClass,
  saveSchoolClass,
} from '../database/repositories/schoolClass.repo';
import {
  getBeneficiaryProductPayment,
  increaseOutstandingAmount,
  listBeneficiaryProductPayments,
  saveBeneficiaryProductPayment,
  updateBeneficiaryProductPayment,
} from '../database/repositories/beneficiaryProductPayment.repo';
import { listSchoolProduct } from '../database/repositories/schoolProduct.repo';
import { listProductTransaction } from '../database/repositories/productTransaction.repo';
import { Sanitizer } from '../utils/sanitizer';
import { getSchoolSession } from '../database/repositories/schoolSession.repo';

class StudentSetupBuilder {
  private classId: string | number;
  private schoolId: number;
  private session: any;
  private schoolClass: any;

  constructor(private payload: { class: string | number; school: number | { id: number }; session: any }) {
    this.classId = payload.class;
    this.schoolId = typeof payload.school === 'number' ? payload.school : payload.school.id;
    this.session = payload.session;
  }

  async setClassId(): Promise<StudentSetupBuilder> {
    if (typeof this.classId === 'string' && this.classId.includes('cll_')) {
      const foundClassLevel = await getClassLevel({ code: this.classId }, []);
      if (!foundClassLevel) throw new NotFoundError('Class Level');
      this.classId = foundClassLevel.id;
    }
    if (typeof this.classId === 'string' && this.classId.includes('shc_')) {
      const schoolClass = await getSchoolClass({ code: this.classId }, [], ['ClassLevel']);
      if (!schoolClass) throw new NotFoundError('Class For School');
      this.classId = schoolClass.class_id;
    }
    return this;
  }

  async setSession(): Promise<StudentSetupBuilder> {
    if (!this.session) {
      this.session = await getSchoolSession({ country: 'UGANDA', status: STATUSES.ACTIVE }, []);
    }
    return this;
  }

  async setSchoolClass(): Promise<StudentSetupBuilder> {
    const foundSchoolClass = await getSchoolClass({ school_id: this.schoolId, class_id: this.classId, status: STATUSES.ACTIVE }, []);
    if (!foundSchoolClass) throw new NotFoundError(`Class for this this school`);
    this.schoolClass = foundSchoolClass;
    return this;
  }

  build(): { classId: string | number; schoolId: number; session: any; schoolClass: any } {
    return {
      classId: this.classId,
      schoolId: this.schoolId,
      session: this.session,
      schoolClass: this.schoolClass,
    };
  }
}

interface ServiceInterface {
  [key: string]: (...data: any) => Promise<any>;
  addStudentToSchool(payload: any): Promise<theResponse>;
  addFeesForStudent(data: any): Promise<void>;
  runService(service: string, item: any, supportData: any): Promise<any>;
  callService(service: string, payload: any, supportData: any): Promise<any>;
  findExistingGuardians(student: any): Promise<theResponse>;
  addGuardian(data: any): Promise<theResponse>;
  listClassLevels(): Promise<theResponse>;
  getStudent(criteria: any): Promise<theResponse>;
  getStudentHistory(criteria: any): Promise<theResponse>;
  getStudentFees(criteria: any): Promise<theResponse>;
  deactivateStudentFee(criteria: any): Promise<theResponse>;
  editStudentFee(criteria: any): Promise<theResponse>;
  deactivateStudent(criteria: any): Promise<theResponse>;
  listStudents(criteria: any): Promise<theResponse>;
  addModelsToStudent(data: any): Promise<any>;
  editStudent(criteria: any): Promise<theResponse>;
  editGuardian(criteria: any): Promise<theResponse>;
  addGuardians(criteria: any): Promise<theResponse>;
  searchStudents(criteria: any): Promise<theResponse>;
  objectExistsInArray(array: any[], obj: any): any;
  addNonExistingGuardians(data: any): Promise<void>;
  generateStudentData(payload: { first_name: string; last_name: string }): Promise<{
    uniqueStudentId: string;
    remember_token: string;
    passwordHash: string;
    studentEmail: string;
  }>;
  addBulkStudentsToSchool(payload: any): Promise<theResponse>;
  addClassToSchoolWitFees(data: any): Promise<theResponse>;
  listStundentsInSchoolClass(data: {
    status: 'ACTIVE' | 'INACTIVE';
    school: any;
    classCode: string;
    perPage: any;
    page: any;
    from: any;
    to: any;
  }): Promise<theResponse>;
  classDetail(data: { status: 'ACTIVE' | 'INACTIVE'; school: any; classCode: string; perPage: any; cursor: any }): Promise<theResponse>;
  classAnalytics(data: { status: 'ACTIVE' | 'INACTIVE'; school: any; classCode: string; groupBy: string }): Promise<theResponse>;
}

const Service: ServiceInterface = {
  // Clases to be used in the code
  async addStudentToSchool(payload: any): Promise<theResponse> {
    const { status = 'active', first_name, last_name, gender, other_name, school, guardians, phone_number: reqPhone, email } = payload;

    const studentSetup = new StudentSetupBuilder({ class: payload.class, school: payload.school, session: payload.session });
    await studentSetup.setClassId();
    await studentSetup.setSession();
    await studentSetup.setSchoolClass();
    const { classId, schoolId, session, schoolClass: foundSchoolClass } = studentSetup.build();

    let { partPayment = 'installmental' } = payload;

    partPayment = partPayment.toUpperCase();
    guardians as { firstName: string; lastName: string; relationship: string; gender: 'male' | 'female' | 'others' }[];

    // default student email
    let studentEmail;
    if (email) studentEmail = email;
    else {
      studentEmail = `${first_name}+${last_name}${Settings.get('DEFAULT_STUDENT_EMAIL')}`;
      const studentsFound = await listUser({ email: Like(`%${first_name}+${last_name}%`) }, []);
      if (studentsFound.length) studentEmail = `${first_name}+${last_name}${studentsFound.length + 1}${Settings.get('DEFAULT_STUDENT_EMAIL')}`;
    }

    const uniqueStudentId = randomstring.generate({ length: 9, charset: 'numeric' });
    const remember_token = randomstring.generate({ length: 6, capitalization: 'lowercase', charset: 'alphanumeric' });
    const passwordHash = bcrypt.hashSync(`${first_name}${last_name}`, 8);

    // Convert status to its corresponding numerical value
    const statusValue = STATUSES[status.toUpperCase() as 'ACTIVE' | 'INACTIVE'];

    // Check if user already exists
    // const existingUser = await findUser({ first_name, last_name, other_name, gender, status: STATUSES.UNVERIFIED }, [], []);
    // if (existingUser) throw new ExistsError('User');

    const studentPayload: any = {
      email: Utils.removeStringWhiteSpace(studentEmail),
      remember_token,
      user_type: 'student',
      first_name,
      last_name,
      gender: gender && gender,
      other_name: other_name && other_name,
      password: passwordHash,
    };
    if (reqPhone) {
      const {
        data: { id: phone_number },
      } = await findOrCreatePhoneNumber(reqPhone);
      studentPayload.phone_number = phone_number;
    }

    const studentUserRecord = await saveAUser(studentPayload);

    // Check if student already exists
    const existingStudent = await getStudent({ userId: studentUserRecord.id }, [], []);
    if (existingStudent) throw new ExistsError('Student');

    const student = await saveStudentREPO({
      schoolId,
      uniqueStudentId,
      userId: studentUserRecord.id,
      status: statusValue,
      paymentTypeId: PAYMENT_TYPE[partPayment.toUpperCase() as 'INSTALLMENTAL' | 'LUMP_SUM' | 'NO_PAYMENT'],
    });

    // Check if student already exists in the class
    const existingStudentClass = await getStudentClass({ studentId: student.id, classId }, [], []);
    if (existingStudentClass) throw new CustomError('Student already exists in the class');

    await saveStudentClassREPO({
      studentId: student.id,
      classId,
      school_id: schoolId,
      session: session.id,
    });

    await Service.addNonExistingGuardians({ school, guardians, student });
    await Service.addFeesForStudent({ school, schoolClass: foundSchoolClass, student });

    return sendObjectResponse('Student created successfully');
  },

  async addFeesForStudent(data: any) {
    const { school, schoolClass, student } = data;
    const classFees = await listSchoolProduct(
      [
        {
          school_class_id: IsNull(),
          status: Not(STATUSES.DELETED),
          school_id: school.id,
        },
        {
          school_class_id: In([schoolClass.id]),
          status: Not(STATUSES.DELETED),
          school_id: school.id,
        },
      ],
      [],
    );
    if (classFees.length)
      await Promise.all(
        classFees.map(async (classFee: ISchoolProduct) => {
          // Check if BeneficiaryProductPayment already exists
          const existingBeneficiaryProductPayment = await getBeneficiaryProductPayment(
            { beneficiary_type: 'student', beneficiary_id: student.id, product_id: classFee.id },
            [],
            [],
          );
          if (!existingBeneficiaryProductPayment) {
            // If not, create a new one
            await saveBeneficiaryProductPayment({
              beneficiary_type: 'student',
              beneficiary_id: student.id,
              product_id: classFee.id,
              amount_paid: 0,
              amount_outstanding: classFee.amount,
              product_currency: classFee.currency,
            });
          }
        }),
      );
  },

  async addNonExistingGuardians(data: any) {
    const { guardians, student, school } = data;
    if (guardians) {
      const { data: incomingGuardians } = await Service.findExistingGuardians(student);
      await Promise.all(guardians.map((guardian: any) => Service.addGuardian({ student, school, incomingGuardians, guardian })));
    }
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

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async findExistingGuardians(student: any): Promise<theResponse> {
    const incomingGuardians: { relationship: string[]; gender: string[] } = {
      relationship: [],
      gender: [],
    };
    const studentGuardians = await listStudentGuardian({ studentId: student.id }, [], ['Guardian']);
    if (studentGuardians.length > 1) throw new ValidationError('Only two Guardians are required');

    incomingGuardians.relationship = mapAnArray(studentGuardians, 'relationship');
    incomingGuardians.gender = mapAnArray(studentGuardians, 'Guardian.gender');

    return sendObjectResponse('Guardian search completed', incomingGuardians);
  },

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async addGuardian(data: any): Promise<theResponse> {
    const { student, school, incomingGuardians, guardian } = data;
    guardian as { relationship: string; firstName: any; lastName: any; gender: any; email?: string; phone_number: any };
    const { relationship, firstName, lastName, email, gender, phone_number } = guardian;
    if (incomingGuardians.gender.includes(gender) && incomingGuardians.relationship.includes(relationship)) throw new ExistsError('Guardian');
    const { data: phone } = await findOrCreatePhoneNumber(phone_number);
    const individual = await findOrCreateIndividual({
      firstName,
      lastName,
      school_id: school.id,
      phone_number: phone.id,
      email,
      gender,
      type: 'guardian',
    });
    await saveStudentGuardianREPO({
      studentId: student.id,
      relationship,
      individualId: individual.id,
    });

    return sendObjectResponse('Guardian added successfully');
  },

  async listClassLevels(): Promise<theResponse> {
    const response = await listClassLevel({}, []);
    return sendObjectResponse('Classes retrieved successfully', response);
  },

  async getStudent(criteria: any): Promise<theResponse> {
    const { studentId } = criteria;
    const student = await getStudent(
      { uniqueStudentId: studentId },
      [],
      [
        'PaymentType',
        'Fees',
        'Fees.FeesHistory',
        'Fees.FeesHistory.beneficiaryFee',
        'Fees.FeesHistory.Payer',
        'Fees.FeesHistory.Transactions',
        'Fees.Fee',
        'Fees.Fee.ProductType',
        'Fees.Fee.PaymentType',
        'Fees.Fee.Period',
        'Fees.Fee.Session',
        'User',
        'User.phoneNumber',
        'School',
        'Classes',
        'Classes.ClassLevel',
        'StudentGuardians',
        'StudentGuardians.Guardian',
        'StudentGuardians.Guardian.phoneNumber',
      ],
    );
    if (!student) throw new NotFoundError('Student');
    return sendObjectResponse('Student retrieved successfully', student);
  },

  async getStudentHistory(criteria: any): Promise<theResponse> {
    const { studentId } = criteria;
    const student = await getStudent({ uniqueStudentId: studentId }, [], ['Fees']);
    if (!student) throw new NotFoundError('Student');

    const studentPaymentTransactionIds = mapAnArray(student.Fees, 'id');

    const paymentTransactions = await listProductTransaction(
      { beneficiary_product_payment_id: In(studentPaymentTransactionIds) },
      [],
      ['Payer', 'beneficiaryFee', 'Transactions', 'StudentClass', 'StudentClass.ClassLevel'],
    );
    const groupedTransactions = createObjectFromArrayWithoutValue(
      Sanitizer.sanitizeAllArray(paymentTransactions, Sanitizer.sanitizePaymentHistory),
      'StudentClass.ClassLevel.class',
      'session',
    );
    return sendObjectResponse('Student payment history retrieved successfully', groupedTransactions);
  },

  async getStudentFees(criteria: any): Promise<theResponse> {
    const { studentId } = criteria;
    const student = await getStudent({ uniqueStudentId: studentId }, [], ['Fees']);
    if (!student) throw new NotFoundError('Student');

    const paymentTransactions = await listBeneficiaryProductPayments(
      { beneficiary_id: student.id, beneficiary_type: 'student' },
      [],
      ['Fee', 'Student', 'Student.Classes', 'Student.Classes.Session', 'Student.Classes.ClassLevel'],
    );
    const groupedTransactions = createObjectFromArrayWithoutValue(
      Sanitizer.sanitizeAllArray(paymentTransactions, Sanitizer.sanitizeBeneficiaryFee),
      'student.class.class',
      'student.session.session',
    );
    return sendObjectResponse('Student Fees retrieved successfully', groupedTransactions);
  },

  async deactivateStudentFee(criteria: any): Promise<theResponse> {
    const { studentId, feeCode } = criteria;
    const student = await getStudent({ uniqueStudentId: studentId }, [], ['Fees']);
    if (!student || student.status === STATUSES.DELETED) throw new NotFoundError('Student');

    const studentPaymentFee = await getBeneficiaryProductPayment(
      { code: feeCode },
      [],
      ['Fee', 'Student', 'Student.Classes', 'Student.Classes.Session', 'Student.Classes.ClassLevel'],
    );
    if (!studentPaymentFee || studentPaymentFee.status === STATUSES.DELETED) throw new NotFoundError('Fee');
    if (!(studentPaymentFee.beneficiary_id === student.id && studentPaymentFee.beneficiary_type === 'student'))
      throw new ValidationError('Fee does not belong to Student');

    await updateBeneficiaryProductPayment({ code: feeCode }, { status: STATUSES.DELETED });
    return sendObjectResponse('Student Fee deactivated successfully');
  },

  async editStudentFee(criteria: any): Promise<theResponse> {
    const { studentId, feeCode, status, amount, isDefaultAmount } = criteria;
    const student = await getStudent({ uniqueStudentId: studentId }, [], ['Fees']);
    if (!student || student.status === STATUSES.DELETED) throw new NotFoundError('Student');

    const studentPaymentFee = await getBeneficiaryProductPayment({ code: feeCode }, [], ['Fee']);
    if (!studentPaymentFee || studentPaymentFee.status === STATUSES.DELETED) throw new NotFoundError('Fee');
    if (!(studentPaymentFee.beneficiary_id === student.id && studentPaymentFee.beneficiary_type === 'student'))
      throw new ValidationError('Fee does not belong to Student');
    const updatePayload: any = {
      status: STATUSES[status.toUpperCase() as 'ACTIVE' | 'INACTIVE'],
    };
    if (amount) {
      updatePayload.is_default_amount = false;
      updatePayload.custom_amount = amount;
    }
    if (isDefaultAmount) updatePayload.is_default_amount = isDefaultAmount;

    await updateBeneficiaryProductPayment({ code: feeCode }, updatePayload);
    if (amount) await increaseOutstandingAmount({ code: feeCode }, amount - studentPaymentFee.Fee.amount);
    return sendObjectResponse('Student Fee updated successfully');
  },

  async deactivateStudent(criteria: any): Promise<theResponse> {
    const { studentId } = criteria;
    const student = await getStudent({ uniqueStudentId: studentId }, [], ['Fees']);
    if (!student || student.status === STATUSES.DELETED) throw new NotFoundError('Student');

    await updateStudent({ id: student.id }, { status: STATUSES.DELETED });
    return sendObjectResponse('Student deleted successfully');
  },

  async listStudents(criteria: any): Promise<theResponse> {
    const { schoolId, perPage, page, from, to } = criteria;

    const response = await listStudent(
      { schoolId, perPage, page, from, to },
      [],
      [
        'User',
        'User.phoneNumber',
        'Fees',
        'PaymentType',
        'Fees.FeesHistory',
        'Fees.FeesHistory.beneficiaryFee',
        'Fees.FeesHistory.Payer',
        'Fees.FeesHistory.Transactions',
        'Fees.Fee',
        'Fees.Fee.ProductType',
        'Fees.Fee.PaymentType',
        'Fees.Fee.Period',
        'Fees.Fee.Session',
        'School',
        'Classes',
        'Classes.ClassLevel',
        'StudentGuardians',
        'StudentGuardians.Guardian',
        'StudentGuardians.Guardian.phoneNumber',
      ],
    );
    // const gottenFees = await Promise.all(response.map(Service.addModelsToStudent));

    return sendObjectResponse('Students retrieved successfully', response);
  },

  async addModelsToStudent(data: any): Promise<any> {
    const { School, Classes } = data;
    const studentCurrentClass = Classes.filter((value: IStudentClass) => value.status === STATUSES.ACTIVE);
    const classFees = await listSchoolClass(
      {
        school_id: School.id,
        class_id: studentCurrentClass[0].ClassLevel.id,
      },
      [],
      ['Fees', 'Fees.ProductType', 'Fees.PaymentType', 'Fees.Period', 'Fees.Session'],
    );

    return {
      ...data,
      classFees,
    };
  },

  async editStudent(criteria: any): Promise<theResponse> {
    const { status, id: studentId, guardians, addGuardians, phone_number: reqPhone, school } = criteria;
    // let { class: classId, partPayment } = criteria;
    let { partPayment } = criteria;

    const studentSetup = new StudentSetupBuilder({ class: criteria.class, school: criteria.school, session: criteria.session });
    await studentSetup.setClassId();
    await studentSetup.setSchoolClass();
    const { schoolClass: foundSchoolClass } = studentSetup.build();
    const { id: classId } = foundSchoolClass.id;

    if (addGuardians && addGuardians.length > 2) throw new ValidationError('You can not have more than two(2) Guardians');
    const student = await getStudent(
      { id: studentId },
      [],
      ['User', 'School', 'Classes', 'Classes.ClassLevel', 'StudentGuardians', 'StudentGuardians.Guardian'],
    );
    if (!student) throw new NotFoundError('Student');
    if (addGuardians && addGuardians.length && student.StudentGuardians.length > 1)
      throw new ValidationError('You have hit the max number of guardians for this student');

    const updateStudentPayload: any = {};
    if (partPayment) {
      partPayment = partPayment.toUpperCase();
      updateStudentPayload.paymentTypeId = PAYMENT_TYPE[partPayment.toUpperCase() as 'INSTALLMENTAL' | 'LUMP_SUM' | 'NO_PAYMENT'];
    }
    if (status) {
      updateStudentPayload.status = STATUSES[status.toUpperCase() as 'ACTIVE' | 'INACTIVE'];
    }
    if (status || partPayment) await updateStudent({ id: student.id }, updateStudentPayload);
    if (classId) {
      const existingClass = await getSchoolClass({ code: classId }, []);
      if (!existingClass) throw new NotFoundError('class');
      await updateStudentClass({ id: student.id }, { classId: existingClass.class_id });
    }
    const studentPayload: any = {};
    if (criteria.first_name) studentPayload.first_name = criteria.first_name;
    if (criteria.last_name) studentPayload.last_name = criteria.last_name;
    if (criteria.other_name) studentPayload.other_name = criteria.other_name;
    if (criteria.email) studentPayload.email = criteria.email;
    if (criteria.gender) studentPayload.gender = criteria.gender;
    if (reqPhone) {
      const {
        data: { id: phone_number },
      } = await findOrCreatePhoneNumber(reqPhone);
      studentPayload.phone_number = phone_number;
    }
    await updateUser({ id: student.userId }, studentPayload);

    if (guardians) await Promise.all(guardians.map((guardian: any) => Service.editGuardian({ guardian, student })));

    if (addGuardians && addGuardians.length) await Service.addGuardians({ id: studentId, guardians: addGuardians });

    return sendObjectResponse('Students edited successfully');
  },

  async editGuardian(criteria: any): Promise<theResponse> {
    const { guardian, student } = criteria;
    const { details, code } = guardian;
    const { relationship, gender, firstName, lastName, phone_number, email } = details;
    const [guardianToEdit] = student.StudentGuardians.filter((value: any) => value.code === code);
    if (!guardianToEdit) throw new NotFoundError('Guardian for this student');

    if (relationship) await updateStudentGuardian({ id: guardianToEdit.id }, { relationship });

    const individualPayload: any = {};
    if (firstName) individualPayload.firstName = firstName;
    if (lastName) individualPayload.lastName = lastName;
    if (gender) individualPayload.gender = gender;
    if (email) individualPayload.email = email;
    if (phone_number) {
      const { data: phone } = await findOrCreatePhoneNumber(phone_number);
      individualPayload.phone_number = phone.id;
    }
    await updateIndividual({ id: guardianToEdit.Guardian.id }, individualPayload);

    return sendObjectResponse('Guardian edited successfully');
  },

  async addGuardians(criteria: any): Promise<theResponse> {
    const { id: studentId, guardians } = criteria;
    const student = await getStudent(
      { id: studentId },
      [],
      ['User', 'School', 'Classes', 'Classes.ClassLevel', 'StudentGuardians', 'StudentGuardians.Guardian'],
    );
    if (!student) throw new NotFoundError('Student');
    if (student.StudentGuardians.length > 1) throw new ValidationError('You have hit the max number of guardians for this student');

    const { data: incomingGuardians } = await Service.findExistingGuardians(student);
    await Promise.all(guardians.map((guardian: any) => Service.addGuardian({ student, school: student.School, incomingGuardians, guardian })));
    return sendObjectResponse('Guardians added successfully');
  },

  async searchStudents(criteria: any): Promise<theResponse> {
    const { schoolId: school, students } = criteria as { schoolId: number; students: { class: number; last_name: string; first_name: string }[] };

    // create the query to get all students with similar name regardless of name type
    const queriedParams = students.map((student) => {
      const { class: incomingClass, ...rest } = student;
      return {
        ...rest,
        user_type: 'student',
      };
    });

    const response = await listUser(queriedParams, [], ['Student', 'Student.Classes', 'Student.Classes.ClassLevel']);

    // Check if the found students are in the class and school as the students searched
    let filteredUsers = response.map((user) => {
      const { first_name, last_name, Student } = user;
      const { schoolId, Classes } = Student as any;
      const activeClass = Classes.find((c: any) => c.status === STATUSES.ACTIVE);
      const classId = activeClass ? activeClass.ClassLevel.id : null;

      const studentExist = Service.objectExistsInArray(students, { schoolId: school, first_name, last_name, class: classId });
      if (schoolId === school && studentExist) return { first_name, last_name, schoolId, class: classId };
    });

    filteredUsers = filteredUsers.filter(Boolean);
    if (filteredUsers.length)
      throw new CustomError('The Submitted Array has some existing student(s)', HttpStatus.CONFLICT, { students: filteredUsers });

    return sendObjectResponse('No existing Student');
  },

  objectExistsInArray(array: any[], obj: any): any {
    return array.some(
      (item) =>
        item.first_name.toLowerCase() === obj.first_name.toLowerCase() &&
        item.last_name.toLowerCase() === obj.last_name.toLowerCase() &&
        item.class === obj.class,
    );
  },

  async generateStudentData(payload: { first_name: string; last_name: string }): Promise<{
    uniqueStudentId: string;
    remember_token: string;
    passwordHash: string;
    studentEmail: string;
  }> {
    const { first_name, last_name } = payload;

    let studentEmail = `${first_name}+${last_name}+student${Settings.get('DEFAULT_STUDENT_EMAIL')}`;
    const studentsFound = await listUser({ email: Like(`%${first_name}+${last_name}%`) }, []);
    if (studentsFound && studentsFound.length)
      studentEmail = `${first_name}+${last_name}${studentsFound.length + 1}${Settings.get('DEFAULT_STUDENT_EMAIL')}`;

    return {
      uniqueStudentId: randomstring.generate({ length: 9, charset: 'numeric' }),
      remember_token: randomstring.generate({ length: 6, capitalization: 'lowercase', charset: 'alphanumeric' }),
      passwordHash: bcrypt.hashSync(`${first_name}${last_name}`, 8),
      studentEmail: Utils.removeStringWhiteSpace(studentEmail),
    };
  },

  async addBulkStudentsToSchool(payload: any): Promise<theResponse> {
    const { students, schoolId: school, school: currentSchool, session: incomingSession } = payload as any;

    // update students array payload
    await Promise.all(
      students.map(async (student: any, index: string | number) => {
        const { class: incomingClassId, last_name, first_name, guardians } = student;

        const studentSetup = new StudentSetupBuilder({ class: incomingClassId, school, session: incomingSession });
        await studentSetup.setClassId();
        await studentSetup.setSession();
        await studentSetup.setSchoolClass();
        const { classId, schoolId, session, schoolClass: foundSchoolClass } = studentSetup.build();

        const generatedStudent = await Service.generateStudentData({ last_name, first_name });
        const { uniqueStudentId, remember_token, passwordHash, studentEmail } = generatedStudent;
        students[index].user = {
          email: studentEmail,
          remember_token,
          user_type: 'student',
          first_name,
          last_name,
          password: passwordHash,
        };
        students[index].student = {
          schoolId: school,
          uniqueStudentId,
        };
        students[index].class = {
          classId,
          school_id: schoolId,
          session: session.id,
        };
        students[index].schoolClass = foundSchoolClass;
        students[index].guardians = guardians;

        return { index, ...generatedStudent };
      }),
    );

    const studentUserRecord = await saveAUser(mapAnArray(students, 'user'));

    // update only the student payload in the students array
    await Promise.all(
      students.map((student: { class: any; last_name: any; first_name: any }, index: string | number) => {
        students[index].student = {
          ...students[index].student,
          userId: (studentUserRecord as any)[index].id,
        };
      }),
    );

    const studentRecord = await saveStudentREPO(mapAnArray(students, 'student'));

    // update only the class payload in the students array
    await Promise.all(
      students.map((student: { class: any; last_name: any; first_name: any }, index: string | number) => {
        students[index].class = {
          ...students[index].class,
          studentId: (studentRecord as any)[index].id,
        };
      }),
    );

    await saveStudentClassREPO(mapAnArray(students, 'class'));

    await Service.callService('addNonExistingGuardians', students, { school: currentSchool });
    await Service.callService('addFeesForStudent', students, { school: currentSchool });

    return sendObjectResponse('Students added successfully');
  },

  async addClassToSchoolWitFees(data: any): Promise<theResponse> {
    const {
      forPeriod = false,
      forSession = false,
      expiresAtPeriodEnd = false,
      description,
      amount,
      currency = 'UGX',
      image,
      school,
      class: classCode,
      eduPeriodCode,
      periodCode,
      paymentType = 'install-mental',
      productType = 'tuition',
      session,
    } = data;
    const {
      data: { foundClassLevel, feature_name, paymentTypes, foundProductType, periodManagement, sessionUse, schoolClass: foundSchoolClass },
    } = await FeesService.generateFeeData({ ...data, addClass: true });
    if (foundSchoolClass) throw new ExistsError(`Class`);

    // check if class and product exist
    const schoolClass = await saveSchoolClass({
      school_id: school.id,
      class_id: foundClassLevel,
      status: STATUSES.ACTIVE,
    });

    // Add School Product
    const fee = await FeesService.findOrCreateASchoolProduct({
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
      foundClassLevel,
      beneficiary_type: 'student',
    });
    return sendObjectResponse('Added Class to School Successfully');
  },

  async listStundentsInSchoolClass(data: {
    status: 'ACTIVE' | 'INACTIVE';
    school: any;
    classCode: string;
    perPage: any;
    page: any;
    from: any;
    to: any;
  }): Promise<theResponse> {
    const { school, classCode, status = 'ACTIVE', perPage, page, from, to } = data;
    const foundClassLevel = await getClassLevel({ code: classCode }, []);
    if (!foundClassLevel) throw new NotFoundError('Class Level');

    const statusId = STATUSES[status];

    const studentClass = await listStundentsInSchoolClass(
      {
        schoolId: school.id,
        classId: foundClassLevel.id,
        status: statusId,
        perPage,
        page,
        from,
        to,
      },
      [],
      ['student.Fees', 'student.Fees.Fee', 'student.User', 'student.Fees.FeesHistory'],
    );
    const { students, meta } = studentClass;
    return sendObjectResponse('Retrieved Students in Class Successfully', { students, meta });
  },

  async classDetail(data: { status: 'ACTIVE' | 'INACTIVE'; school: any; classCode: string; perPage: any; cursor: any }): Promise<theResponse> {
    const { school, classCode } = data;
    const foundClassLevel = await getClassLevel({ code: classCode }, []);
    if (!foundClassLevel) throw new NotFoundError('Class Level');

    const foundSchoolClass = await getSchoolClass({ class_id: foundClassLevel.id, school_id: school.id }, []);
    if (!foundSchoolClass) throw new NotFoundError('Class for School');

    const classDetails = await getSchoolClassDetails({ schoolId: school.id, classId: foundClassLevel.id, groupingInterval: 'week' });
    const [classDetail] = classDetails.filter((value: any) => value.currency === 'UGX');
    console.log({ foundSchoolClass });

    const { code, ...rest } = foundClassLevel;
    return sendObjectResponse('Added Class to School Successfully', { code: foundSchoolClass.code, ...rest, ...classDetail });
  },

  async classAnalytics(data: { status: 'ACTIVE' | 'INACTIVE'; school: any; classCode: string; groupBy: string }): Promise<theResponse> {
    const { school, classCode, groupBy } = data;
    const foundClassLevel = await getClassLevel({ code: classCode }, []);
    if (!foundClassLevel) throw new NotFoundError('Class Level');

    const classAnalytics = await getClassAnalytics({ schoolId: school.id, classId: foundClassLevel.id, groupingInterval: groupBy || 'daily' });

    return sendObjectResponse('Added Class to School Successfully', classAnalytics);
  },
};

export default Service;
