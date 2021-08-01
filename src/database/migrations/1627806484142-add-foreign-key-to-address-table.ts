import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class addForeignKeyToAddressTable1627806484142 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const addTrackingId = new TableColumn({
      name: 'trackingId',
      type: 'int',
      isNullable: true,
    });

    const trackingId = new TableForeignKey({
      columnNames: ['trackingId'],
      referencedTableName: 'tracking',
      referencedColumnNames: ['id'],
    });

    await queryRunner.addColumns('addresses', [addTrackingId]);
    await queryRunner.createForeignKeys('addresses', [trackingId]);
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
