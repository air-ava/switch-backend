import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class updateToTrackingTable51627813210656 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tracking_ref = new TableColumn({
      name: 'tracking_ref',
      type: 'text',
    });

    const addTrackRef = new TableColumn({
      name: 'tracking_ref',
      type: 'text',
      isNullable: true,
    });

    await queryRunner.dropColumns('tracking', [tracking_ref]);
    await queryRunner.addColumns('orders', [addTrackRef]);
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
