import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { STATUSES } from '../models/status.model';

export class createTransactionsTable1676340079684 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'txn_type',
            type: 'enum',
            enum: ['credit', 'debit'],
            isNullable: false,
          },
          {
            name: 'walletId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'int',
            default: 14,
            isNullable: false,
          },
          {
            name: 'purpose',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'note',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'document_reference',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'reference',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'balance_after',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'balance_before',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'varchar',
            isNullable: false,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'channel',
            type: 'varchar',
            default: `'mobile-money'`,
            isNullable: false,
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
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('transactions');
  }
}
