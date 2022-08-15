import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createOrderTable1660175871711 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order',
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
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'processor',
            type: 'varchar',
            default: `'paystack'`,
            isNullable: false,
          },
          {
            name: 'payment_reference',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'shopper_address',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'business_address',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'shopper',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'business',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'external_reference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order');
  }
}
