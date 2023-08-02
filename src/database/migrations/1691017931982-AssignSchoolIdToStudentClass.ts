/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import { Student } from '../models/student.model';
import { StudentClass } from '../models/studentClass.model';

export class AssignSchoolIdToStudentClass1691017931982 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE student_class
            JOIN students ON student_class.studentId = students.id
            SET student_class.school_id = students.schoolId;    
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert logic if needed
  }
}
