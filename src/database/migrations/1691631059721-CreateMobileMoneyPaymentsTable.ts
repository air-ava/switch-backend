import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMobileMoneyPaymentsTable1691631059721 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mobile_money_payments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'status',
            type: 'int',
            default: 20,
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
            name: 'fee',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            default: "'UGX'",
          },
          {
            name: 'narration',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'varchar',
          },
          {
            name: 'code',
            type: 'varchar',
          },
          {
            name: 'transaction_reference',
            type: 'varchar',
          },
          {
            name: 'processor_reference',
            type: 'varchar',
          },
          {
            name: 'processor',
            type: 'varchar',
            default: "'BEYONIC'",
          },
          {
            name: 'response',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'receiver',
            type: 'int',
          },
          {
            name: 'type',
            type: 'varchar',
            default: "'mobile-money'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('mobile_money_payments');
  }
}
