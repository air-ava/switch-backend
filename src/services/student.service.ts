import randomstring from 'randomstring';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { STATUSES } from '../database/models/status.model';
import { listClassLevel } from '../database/repositories/classLevel.repo';
import { saveMobileMoneyTransaction } from '../database/repositories/mobileMoneyTransactions.repo';
import { saveTransaction } from '../database/repositories/transaction.repo';
import { listUser, saveAUser } from '../database/repositories/user.repo';
import { sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { getStudent, listStudent, saveStudentREPO } from '../database/repositories/student.repo';
import { saveStudentClassREPO } from '../database/repositories/studentClass.repo';
import Settings from './settings.service';
import { Like } from 'typeorm';

const Service = {
  async addStudentToSchool(payload: any) {
    const { first_name, last_name, school, organisation, class: classId } = payload;

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
      schoolId: school.id,
      uniqueStudentId,
      userId: studentUserRecord.id,
    });

    await saveStudentClassREPO({
      studentId: student.id,
      classId,
    });

    return sendObjectResponse('Student created successfully');
  },

  async listClassLevels(): Promise<theResponse> {
    const response = await listClassLevel({}, []);
    return sendObjectResponse('Classes retrieved successfully', response);
  },
 
  async getStudent(criteria: any): Promise<theResponse> {
    const { studentId } = criteria;
    const student = await getStudent({ uniqueStudentId: studentId }, [], ['User', 'School', 'Classes', 'Classes.ClassLevel']);
    if (!student) throw Error('Student not found');
    return sendObjectResponse('Student retrieved successfully', student);
  },

  async listStudents(criteria: any): Promise<theResponse> {
    const { schoolId } = criteria;
    const response = await listStudent({ schoolId }, [], ['User', 'School', 'Classes', 'Classes.ClassLevel']);
    return sendObjectResponse('Students retrieved successfully', response);
  },
};

export default Service;
