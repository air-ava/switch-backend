import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createCartTable1660175458378 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cart',
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
          },
          {
            name: 'order_reference',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'completed',
            type: 'boolean',
            default: false,
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
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
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
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cart');
  }
}
