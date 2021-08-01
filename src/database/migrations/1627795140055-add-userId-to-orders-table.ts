import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class addUserIdToOrdersTable1627795140055 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const addUserId = new TableColumn({
      name: 'userId',
      type: 'int',
      isNullable: true,
    });

    const userId = new TableForeignKey({
      columnNames: ['userId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
    });

    await queryRunner.addColumns('orders', [addUserId]);
    await queryRunner.createForeignKeys('orders', [userId]);
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
