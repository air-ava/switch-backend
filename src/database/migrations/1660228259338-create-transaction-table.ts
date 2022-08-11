import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

const foreignKeys = {
  shopper: new TableForeignKey({
    columnNames: ['shopper'],
    referencedTableName: 'users',
    referencedColumnNames: ['id'],
  }),
  business: new TableForeignKey({
    columnNames: ['business'],
    referencedTableName: 'business',
    referencedColumnNames: ['id'],
  }),
};

const { shopper, business } = foreignKeys;

export class createTransactionTable1660228259338 implements MigrationInterface {
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
            name: 'reference',
            type: 'varchar',
            isUnique: true,
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
            name: 'txn_type',
            type: 'enum',
            enum: ['debit', 'credit'],
            isNullable: false,
          },
          {
            name: 'shopper',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'business',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'purpose',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'processor',
            type: 'varchar',
            default: `'paystack'`,
            isNullable: true,
          },
          {
            name: 'response',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'processor_reference',
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
            isNullable: false,
          },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKeys('transactions', [shopper, business]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys('transactions', [shopper, business]);
    await queryRunner.dropTable('transactions');
  }
}
