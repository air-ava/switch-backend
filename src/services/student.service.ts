import { StudentGuardian } from './../database/models/studentGuardian.model';
import randomstring from 'randomstring';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { ILike, In, Like, Raw } from 'typeorm';
import { IStudent, IStudentClass } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { PAYMENT_TYPE } from '../database/models/paymentType.model';
import { getClassLevel, listClassLevel } from '../database/repositories/classLevel.repo';
import { saveMobileMoneyTransaction } from '../database/repositories/mobileMoneyTransactions.repo';
import { saveTransaction } from '../database/repositories/transaction.repo';
import { HttpStatus, CustomError, sendObjectResponse, ExistsError, NotFoundError, ValidationError } from '../utils/errors';
import {
  // getSearchUsers,
  listUser,
  saveAUser,
  updateUser,
} from '../database/repositories/user.repo';
import { theResponse } from '../utils/interface';
import { getStudent, listStudent, saveStudentREPO, updateStudent } from '../database/repositories/student.repo';
import { getStudentClass, saveStudentClassREPO, updateStudentClass } from '../database/repositories/studentClass.repo';
import Settings from './settings.service';
import { mapAnArray } from '../utils/utils';
import { IUser } from '../database/modelInterfaces';
import { saveIndividual, updateIndividual } from '../database/repositories/individual.repo';
import { listStudentGuardian, saveStudentGuardianREPO, updateStudentGuardian } from '../database/repositories/studentGuardian.repo';
import { findOrCreatePhoneNumber } from './helper.service';
import { saveSchoolClass } from '../database/repositories/schoolClass.repo';

const Service = {
  async addStudentToSchool(payload: any) {
    const { first_name, last_name, school, class: classId, guardians } = payload;
    let { partPayment = 'installmental' } = payload;
    partPayment = partPayment.toUpperCase();
    guardians as { firstName: string; lastName: string; relationship: string; gender: 'male' | 'female' | 'others' }[];

    const schoolId = typeof school === 'number' ? school : school.id;

    // default student email
    let studentEmail = `${first_name}+${last_name}+student${Settings.get('DEFAULT_STUDENT_EMAIL')}`;
    const studentsFound = await listUser({ email: Like(`%${first_name}+${last_name}%`) }, []);
    if (studentsFound.length) studentEmail = `${first_name}+${last_name}${studentsFound.length + 1}${Settings.get('DEFAULT_STUDENT_EMAIL')}`;

    const uniqueStudentId = randomstring.generate({ length: 9, charset: 'numeric' });
    const remember_token = randomstring.generate({ length: 6, capitalization: 'lowercase', charset: 'alphanumeric' });
    const passwordHash = bcrypt.hashSync(`${first_name}${last_name}`, 8);

    const studentUserRecord = await saveAUser({
      email: studentEmail,
      remember_token,
      user_type: 'student',
      first_name,
      last_name,
      password: passwordHash,
    });

    const student = await saveStudentREPO({
      schoolId,
      uniqueStudentId,
      userId: studentUserRecord.id,
      paymentTypeId: PAYMENT_TYPE[partPayment as 'INSTALLMENTAL' | 'LUMP_SUM' | 'NO_PAYMENT'],
    });

    await saveStudentClassREPO({
      studentId: student.id,
      classId,
    });

    if (guardians) {
      const { data: incomingGuardians } = await Service.findExistingGuardians(student);
      await Promise.all(guardians.map((guardian: any) => Service.addGuardian({ student, school, incomingGuardians, guardian })));
    }

    return sendObjectResponse('Student created successfully');
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
    const individual = await saveIndividual({
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
      ['User', 'School', 'Classes', 'Classes.ClassLevel', 'StudentGuardians', 'StudentGuardians.Guardian', 'StudentGuardians.Guardian.phoneNumber'],
    );
    if (!student) throw Error('Student not found');
    return sendObjectResponse('Student retrieved successfully', student);
  },

  async listStudents(criteria: any): Promise<theResponse> {
    const { schoolId } = criteria;
    const response = await listStudent(
      { schoolId },
      [],
      ['User', 'School', 'Classes', 'Classes.ClassLevel', 'StudentGuardians', 'StudentGuardians.Guardian', 'StudentGuardians.Guardian.phoneNumber'],
    );
    return sendObjectResponse('Students retrieved successfully', response);
  },

  async editStudent(criteria: any): Promise<theResponse> {
    const { id: studentId, guardian, class: classId } = criteria;
    let { partPayment } = criteria;
    const student = await getStudent(
      { id: studentId },
      [],
      ['User', 'School', 'Classes', 'Classes.ClassLevel', 'StudentGuardians', 'StudentGuardians.Guardian'],
    );
    if (!student) throw new NotFoundError('Student');

    if (partPayment) {
      partPayment = partPayment.toUpperCase();
      await updateStudent({ id: student.id }, { paymentTypeId: PAYMENT_TYPE[partPayment as 'INSTALLMENTAL' | 'LUMP_SUM' | 'NO_PAYMENT'] });
    }
    if (classId) {
      const existingClass = await getStudentClass({ id: classId }, []);
      if (!existingClass) throw new NotFoundError('class');
      await updateStudentClass({ id: student.id }, { classId });
    }
    const studentPayload: any = {};
    if (criteria.firstName) studentPayload.firstName = criteria.firstName;
    if (criteria.lastName) studentPayload.lastName = criteria.lastName;
    if (criteria.email) studentPayload.email = criteria.email;
    await updateUser({ id: student.userId }, studentPayload);

    if (guardian) {
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
    }

    return sendObjectResponse('Students edited successfully');
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
      studentEmail,
    };
  },

  async addBulkStudentsToSchool(payload: any): Promise<theResponse> {
    const { students, schoolId: school } = payload as any;

    // update students array payload
    await Promise.all(
      students.map(async (student: { class: any; last_name: any; first_name: any }, index: string | number) => {
        const { class: classId, last_name, first_name } = student;
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
        };

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

    return sendObjectResponse('Students added successfully');
  },

  async addClassToSchool(data: any): Promise<theResponse> {
    const { school, class: classCode, periods } = data;
    periods as { amount: number; periodCode: string; description: string, currency: string }[];
    const foundClassLevel = await getClassLevel({ code: classCode }, []);
    if (!foundClassLevel) throw new NotFoundError('Class Level');

    // Create Adding Periods
    // find the Periods - [ACTIVE] -  in the map
    // find the Session - [ACTIVE]

    const schoolClass = await saveSchoolClass({
      schoolId: school.id,
      classId: foundClassLevel.id,
    });

    // Add price amount for the period
    return sendObjectResponse('Added Class to School Successfully');

  }
};

export default Service;
