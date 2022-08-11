import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const columnsToChanges = {
  cart: {
    oldColumn: new TableColumn({
      name: 'order',
      type: 'int',
      isNullable: false,
    }),
    newColumn: new TableColumn({
      name: 'cart',
      type: 'int',
      isNullable: false,
    }),
  },
};

const { cart } = columnsToChanges;

export class changeColunmNameCartProductTable1660222169131 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('cart_product', [cart]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('cart_product', [{ oldColumn: cart.newColumn, newColumn: cart.oldColumn }]);
  }
}
