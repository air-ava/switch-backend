import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createCurrencyRateTable1679257418591 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'currency_rate',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'base_currency',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'buy_rate',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'sell_rate',
            type: 'varchar',
            isNullable: false,
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
    await queryRunner.dropTable('currency_rate');
  }
}
