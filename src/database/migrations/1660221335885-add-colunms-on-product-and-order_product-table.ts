import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const columns = {
  quantity: new TableColumn({
    name: 'quantity',
    type: 'decimal',
    default: 0,
    unsigned: true,
    precision: 20,
    scale: 4,
    isNullable: false,
  }),
  unlimited: new TableColumn({
    name: 'unlimited',
    type: 'boolean',
    default: false,
    isNullable: false,
  }),
};

const { unlimited, quantity } = columns;

export class addColunmsOnProductAndOrderProductTable1660221335885 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('order_product', 'cart_product');
    await queryRunner.addColumns('cart_product', [quantity]);
    await queryRunner.addColumns('product', [unlimited]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('cart_product', 'order_product');
    await queryRunner.dropColumns('order_product', [quantity]);
    await queryRunner.dropColumns('product', [unlimited]);
  }
}
