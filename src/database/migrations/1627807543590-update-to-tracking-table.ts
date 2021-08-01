import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class updateToTrackingTable1627807543590 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('tracking', [
      {
        oldColumn: new TableColumn({
          name: 'addressId',
          type: 'int',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'addressId',
          type: 'int',
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'orderId',
          type: 'int',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'orderId',
          type: 'int',
          isNullable: true,
        }),
      },
    ]);
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
