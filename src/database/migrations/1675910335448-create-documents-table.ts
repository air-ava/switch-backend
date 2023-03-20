import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { STATUSES } from '../models/status.model';

export class createDocumentsTable1675910335448 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'reference',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'processor',
            type: 'varchar',
            default: `'smileID'`,
            isNullable: false,
          },
          {
            name: 'response',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'trigger',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'int',
            default: STATUSES.UNVERIFIED,
            isNullable: false,
          },
          {
            name: 'asset_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'link_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            default: `'UGANDA'`,
            isNullable: true,
          },
          {
            name: 'entity',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'entity_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'expiry_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'issuing_date',
            type: 'timestamp',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('documents');
  }
}
