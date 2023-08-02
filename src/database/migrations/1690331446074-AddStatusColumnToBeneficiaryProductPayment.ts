import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStatusColumnToBeneficiaryProductPayment1690331446074 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add a new column `status` with default value 1 to the `beneficiary_product_payment` table
    await queryRunner.addColumn(
      'beneficiary_product_payment',
      new TableColumn({
        name: 'status',
        type: 'int',
        default: 1,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the changes made in the "up" method if needed
    await queryRunner.dropColumn('beneficiary_product_payment', 'status');
  }
}
