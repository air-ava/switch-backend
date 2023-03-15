import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class addReservedAccountsTransactionsTable1678849808995 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reservedAccountsTransactions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'walletId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'transactionId',
            type: 'int',
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
            name: 'originator_account_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'originator_account_number',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'bank_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'bank_routing_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'bank_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'processor',
            type: 'varchar',
            default: `'STEWARD'`,
            isNullable: true,
          },
          {
            name: 'sessionId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'response',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'narration',
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
    await queryRunner.dropTable('reservedAccountsTransactions');
  }
}
