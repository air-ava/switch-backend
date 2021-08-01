import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createAddressTable1627744607808 implements MigrationInterface {
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
            name: 'userId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'address',
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
            name: 'business_mobile',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
            default: "'is_user'",
            isNullable: false,
          },
          {
            name: 'deleted',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('addresses');
  }
}
