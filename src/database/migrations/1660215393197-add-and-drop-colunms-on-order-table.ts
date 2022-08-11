import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const columns = {
  order_reference: new TableColumn({
    name: 'order_reference',
    type: 'varchar',
    isNullable: false,
  }),
  amount: new TableColumn({
    name: 'amount',
    type: 'decimal',
    default: 0,
    unsigned: true,
    precision: 20,
    scale: 4,
    isNullable: false,
  }),
  quantity: new TableColumn({
    name: 'quantity',
    type: 'decimal',
    default: 0,
    unsigned: true,
    precision: 20,
    scale: 4,
    isNullable: false,
  }),
  cart_reference: new TableColumn({
    name: 'cart_reference',
    type: 'varchar',
    isNullable: false,
  }),
  processor: new TableColumn({
    name: 'processor',
    type: 'varchar',
    isNullable: false,
  }),
};

const { processor, order_reference, amount, quantity, cart_reference } = columns;

export class addAndDropColunmsOnOrderTable1660215393197 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('cart', [order_reference]);
    await queryRunner.addColumns('cart', [amount, quantity]);
    await queryRunner.addColumns('order', [cart_reference]);
    await queryRunner.dropColumns('order', [processor]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('cart', [amount, quantity]);
    await queryRunner.addColumns('cart', [order_reference]);
    await queryRunner.dropColumns('order', [cart_reference]);
    await queryRunner.addColumns('order', [processor]);
  }
}
