import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createCurrenciesTable1679257239412 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'currencies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'short_code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'currency_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'currency_unit_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'icon',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'int',
            default: 1,
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
            isNullable: true,
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('currencies');
  }
}
