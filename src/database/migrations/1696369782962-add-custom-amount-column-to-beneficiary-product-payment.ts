import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const tableData = {
  defaultAmount: new TableColumn({
    name: 'is_default_amount',
    type: 'boolean',
    default: true,
  }),
  customAmount: new TableColumn({
    name: 'custom_amount',
    type: 'decimal',
    default: 0,
    unsigned: true,
    precision: 20,
    scale: 4,
    isNullable: false,
  }),
};

const { customAmount, defaultAmount } = tableData;
export class addCustomAmountColumnToBeneficiaryProductPayment1696369782962 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('beneficiary_product_payment', [defaultAmount, customAmount]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('beneficiary_product_payment', [defaultAmount, customAmount]);
  }
}
