import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCashDepositsTable1696546840591 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cash_deposits',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'code', type: 'varchar', isUnique: true },
          { name: 'student_id', type: 'int' },
          { name: 'recorded_by', type: 'int' },
          { name: 'completed_by', type: 'int', isNullable: true },
          { name: 'payer_id', type: 'int' },
          { name: 'longitude', type: 'varchar', isNullable: true },
          { name: 'latitude', type: 'varchar', isNullable: true },
          { name: 'school_id', type: 'int' },
          { name: 'currency', type: 'varchar', default: "'UGX'" },
          { name: 'amount', type: 'decimal', precision: 20, scale: 4, default: 0 },
          { name: 'class_id', type: 'int' },
          { name: 'period_id', type: 'int', isNullable: true },
          { name: 'session_id', type: 'int' },
          { name: 'beneficiary_product_id', type: 'int' },
          { name: 'status', type: 'int' },
          { name: 'notes', type: 'varchar', isNullable: true },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'reciept_reference', type: 'varchar', isNullable: true },
          { name: 'transaction_reference', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', isNullable: true },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cash_deposits');
  }
}
