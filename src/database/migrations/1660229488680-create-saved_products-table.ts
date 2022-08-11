import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

const foreignKeys = {
  shopper: new TableForeignKey({
    columnNames: ['shopper'],
    referencedTableName: 'users',
    referencedColumnNames: ['id'],
  }),
  business: new TableForeignKey({
    columnNames: ['business'],
    referencedTableName: 'business',
    referencedColumnNames: ['id'],
  }),
};

const { shopper, business } = foreignKeys;
export class createSavedProductsTable1660229488680 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'saved_products',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
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
            name: 'available',
            type: 'boolean',
            default: true,
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
    await queryRunner.createForeignKeys('saved_products', [shopper, business]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys('saved_products', [shopper, business]);
    await queryRunner.dropTable('saved_products');
  }
}
