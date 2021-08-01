import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class updateToTrackingTable31627811802323 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const addId = new TableColumn({
      name: 'location_address_id',
      type: 'int',
      isNullable: true,
    });

    await queryRunner.addColumns('orders', [addId]);
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
