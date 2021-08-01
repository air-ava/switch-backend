import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class addAddressForeignKeyToUserTable1627769861023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const addAddressId = new TableColumn({
      name: 'addressId',
      type: 'int',
      isNullable: true,
    });

    const addOrderId = new TableColumn({
      name: 'orderId',
      type: 'int',
      isNullable: true,
    });

    const addressId = new TableForeignKey({
      columnNames: ['addressId'],
      referencedTableName: 'addresses',
      referencedColumnNames: ['id'],
    });

    const orderId = new TableForeignKey({
      columnNames: ['orderId'],
      referencedTableName: 'orders',
      referencedColumnNames: ['id'],
    });

    await queryRunner.addColumns('users', [addAddressId, addOrderId]);
    await queryRunner.createForeignKeys('users', [addressId, orderId]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
