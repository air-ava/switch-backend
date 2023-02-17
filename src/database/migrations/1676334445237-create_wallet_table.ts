import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';
import { STATUSES } from '../models/status.model';

const addType = new TableColumn({
  name: 'type',
  type: 'varchar',
  default: `'permanent'`,
  isNullable: false,
});

const addCurrency = new TableColumn({
  name: 'currency',
  type: 'varchar',
  default: `'UGX'`,
  isNullable: false,
});

const addId = new TableColumn({
  name: 'id',
  type: 'int',
});

const addUserId = new TableColumn({
  name: 'userId',
  type: 'varchar',
  isNullable: false,
});

const addEntity = new TableColumn({
  name: 'entity',
  type: 'varchar',
  isNullable: false,
});

const addEntityId = new TableColumn({
  name: 'entity_id',
  type: 'varchar',
  isNullable: false,
});

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
            isNullable: false,
          },
          {
            name: 'transaction_pin',
            type: 'varchar',
            isNullable: false,
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
