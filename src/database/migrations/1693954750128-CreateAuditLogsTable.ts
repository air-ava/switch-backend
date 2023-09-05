import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAuditLogsTable1693954750128 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'auditLogs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'event',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'user_type',
            type: 'varchar',
            length: '255',
            isNullable: true,
            default: "'backOfficeUsers'",
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'table_type',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'table_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'initial_state',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'delta',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('AuditLogs');
  }
}
