import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPaymentTypeIdColumnToStudent1684457730677 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'paymentTypeId' column
    await queryRunner.addColumn(
      'students',
      new TableColumn({
        name: 'paymentTypeId',
        type: 'integer',
        isNullable: true, // Adjust the option based on your requirements
        default: 1,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove 'paymentTypeId' column
    await queryRunner.dropColumn('students', 'paymentTypeId');
  }
}
