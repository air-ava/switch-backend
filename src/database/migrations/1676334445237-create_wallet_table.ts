import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';
import { STATUSES } from '../models/status.model';

export class createWalletTable1676334445237 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'entity',
            type: 'varchar(50)',
            isPrimary: true,
            // enum: ['school', 'teacher', 'team', 'subaccount', 'organisation', 'user'],
            default: `'school'`,
            isNullable: false,
          },
          {
            name: 'entity_id',
            type: 'varchar',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'varchar',
            isPrimary: true,
            isNullable: false,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'currency',
            type: 'varchar(10)',
            default: `'UGX'`,
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['temporary', 'permanent'],
            default: `'permanent'`,
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'transaction_webhook_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'transaction_pin',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'balance',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'ledger_balance',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'uniquePaymentId',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'int',
            default: STATUSES.ACTIVE,
            isNullable: false,
          },
          {
            name: 'has_updated_unique_payment_id',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'expiry_date',
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
    // await queryRunner.updatePrimaryKeys('wallets', [addId, addUserId, addCurrency, addType, addEntity, addEntityId]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wallets');
  }
}
