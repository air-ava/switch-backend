import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { STATUSES } from '../models/status.model';

export class addBanksTable1677723163847 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'banks',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'provider',
            type: 'varchar',
            default: `'BEYONIC'`,
            isNullable: false,
          },
          {
            name: 'country',
            type: 'varchar',
            default: `'UGANDA'`,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar(10)',
            default: `'UGX'`,
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'walletId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'number',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'account_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'bank_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'bank_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'bank_routing_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
            default: `'owner'`,
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'int',
            default: STATUSES.ACTIVE,
            isNullable: false,
          },
          {
            name: 'default',
            type: 'boolean',
            default: true,
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
    await queryRunner.dropTable('banks');
  }
}
