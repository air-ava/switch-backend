import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createProductTransactionsTable1685070418517 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_transactions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'tx_reference',
            type: 'varchar',
          },
          {
            name: 'session',
            type: 'varchar',
          },
          {
            name: 'beneficiary_product_payment_id',
            type: 'int',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'outstanding_before',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'outstanding_after',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'payer',
            type: 'int',
          },
          {
            name: 'metadata',
            type: 'json',
          },
          {
            name: 'status',
            type: 'int',
          },
          {
            name: 'code',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product_transactions');
  }
}
