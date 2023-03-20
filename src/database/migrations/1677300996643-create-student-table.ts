import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { STATUSES } from '../models/status.model';

export class createStudentTable1677300996643 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'students',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'schoolId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'uniqueStudentId',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'varchar',
            isNullable: false,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'status',
            type: 'int',
            default: STATUSES.ACTIVE,
            isNullable: false,
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
    await queryRunner.dropTable('student');
  }
}
