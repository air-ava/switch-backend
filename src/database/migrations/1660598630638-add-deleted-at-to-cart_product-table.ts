import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const columns = {
  deleted_at: new TableColumn({
    name: 'deleted_at',
    type: 'timestamp',
    isNullable: true,
  }),
};

const { deleted_at } = columns;
export class addDeletedAtToCartProductTable1660598630638 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('cart_product', [deleted_at]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('cart_product', [deleted_at]);
  }
}
