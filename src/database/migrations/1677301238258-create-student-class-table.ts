import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { STATUSES } from '../models/status.model';

export class createStudentClassTable1677301238258 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'student_class',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'studentId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'classId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'int',
            default: STATUSES.ACTIVE,
            isNullable: false,
            comment: 'The status `ACTIVE` is for current class, `COMPLETED` for past classes',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: true,
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('student-class');
  }
}
