import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createBeneficiaryProductPaymentTable1685070525649 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'beneficiary_product_payment',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'beneficiary_type',
            type: 'varchar',
          },
          {
            name: 'beneficiary_id',
            type: 'int',
          },
          {
            name: 'product_id',
            type: 'int',
          },
          {
            name: 'product_currency',
            type: 'int',
          },
          {
            name: 'amount_paid',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'amount_outstanding',
            type: 'decimal',
            precision: 10,
            scale: 2,
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
    await queryRunner.dropTable('beneficiary_product_payment');
  }
}
