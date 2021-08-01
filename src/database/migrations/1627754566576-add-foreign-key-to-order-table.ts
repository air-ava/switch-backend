import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class addForeignKeyToOrderTable1627754566576 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const addPickupId = new TableColumn({
      name: 'pickupId',
      type: 'int',
      isNullable: false,
    });

    const addDeliveryId = new TableColumn({
      name: 'deliveryId',
      type: 'int',
      isNullable: false,
    });

    const addTrackingId = new TableColumn({
      name: 'trackingId',
      type: 'int',
      isNullable: true,
    });

    const pickupId = new TableForeignKey({
      columnNames: ['pickupId'],
      referencedTableName: 'addresses',
      referencedColumnNames: ['id'],
    });

    const deliveryId = new TableForeignKey({
      columnNames: ['deliveryId'],
      referencedTableName: 'addresses',
      referencedColumnNames: ['id'],
    });

    const trackingId = new TableForeignKey({
      columnNames: ['trackingId'],
      referencedTableName: 'tracking',
      referencedColumnNames: ['id'],
    });

    const pickup_name = new TableColumn({
      name: 'pickup_name',
      type: 'text',
    });

    const pickup_email = new TableColumn({
      name: 'pickup_email',
      type: 'text',
    });

    const delivery_name = new TableColumn({
      name: 'delivery_name',
      type: 'text',
    });

    const delivery_email = new TableColumn({
      name: 'delivery_email',
      type: 'text',
    });

    await queryRunner.addColumns('orders', [addPickupId, addDeliveryId, addTrackingId]);
    await queryRunner.dropColumns('orders', [pickup_name, pickup_email, delivery_name, delivery_email]);
    await queryRunner.createForeignKeys('orders', [pickupId, deliveryId, trackingId]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
  }
}
