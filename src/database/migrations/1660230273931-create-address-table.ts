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

export class createAddressTable1660230273931 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'street',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'country',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'state',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'default',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'shopper',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'business',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'deleted_at',
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
            isNullable: false,
          },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKeys('addresses', [shopper, business]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys('addresses', [shopper, business]);
    await queryRunner.dropTable('addresses');
  }
}
