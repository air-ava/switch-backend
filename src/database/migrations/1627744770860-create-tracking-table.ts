import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createTrackingTable1627744770860 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tracking',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'reference',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'orderId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'addressId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
            isNullable: false,
          },
        ],
      }),
    );

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

    await queryRunner.createForeignKeys('tracking', [addressId, orderId]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tracking');
  }
}
