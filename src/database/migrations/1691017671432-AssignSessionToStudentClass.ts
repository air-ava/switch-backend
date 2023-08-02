import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import { StudentClass } from '../models/studentClass.model';
import { SchoolSession } from '../models/schoolSession.model';

export class AssignSessionToStudentClass1691017671432 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const studentClassRepository = getRepository(StudentClass);
    const schoolSessionRepository = getRepository(SchoolSession);

    const session = await schoolSessionRepository.findOne({ where: { status: 1 } });

    if (session) {
      await studentClassRepository.update({}, { session: session.id });
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert logic if needed
  }
}
