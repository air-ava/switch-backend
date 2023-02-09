import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { STATUSES } from '../models/status.model';

export class createDocumentRequirementsTable1675903611904 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'document_requirements',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'requirement_type',
            type: 'enum',
            enum: ['link', 'number', 'file', 'text'],
            default: `'file'`,
            isNullable: false,
          },
          {
            name: 'required',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'process',
            type: 'varchar',
            default: `'onboarding'`,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'int',
            default: STATUSES.ACTIVE,
            isNullable: false,
          },
          {
            name: 'country',
            type: 'varchar',
            default: `'UGANDA'`,
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
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
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('document_requirements');
  }
}
