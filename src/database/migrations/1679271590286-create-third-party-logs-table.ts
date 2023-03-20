import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createThirdPartyLogsTable1679271590286 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'third_party_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'event',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'message',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'school',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status_code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'provider_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'provider',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'endpoint',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'endpoint_verb',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payload',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'reference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
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
    await queryRunner.dropTable('third_party_logs');
  }
}
