import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'currencies',
    column: '`code`, `short_code`, `currency_name`, `currency_unit_name`',
    rows: [
      `'1234', 'NGN', 'Nigerian Naira', 'Kobo'`,
      `'1235', 'KES', 'Kenyan shilling', 'Cent'`,
      `'1236', 'ZAR', 'South African rand', 'Cent'`,
      `'1237', 'GHS', 'Ghanaian cedi', 'Pesewa'`,
      `'1238', 'CFA', 'West African CFA franc', 'Centime'`,
      `'1239', 'UGX', 'Ugandan shilling', 'Cent'`,
      `'1230', 'USD', 'United State Dollar', 'Cent'`,
      `'1210', 'CAD', 'Canadian Dollar', 'Cent'`,
      `'1211', 'GBP', 'Pound sterling', 'Penny'`,
    ],
  },
];

export class seedCurrenciesTable1679268282400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      seedData.map((seed) => seed.rows.map((value) => queryRunner.query(`INSERT INTO ${seed.name} (${seed.column}) VALUES (${value})`))),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      seedData.map((seed) => seed.rows.map((value) => queryRunner.query(`DELETE FROM ${seed.name} WHERE ${seed.column}='${value}';`))),
    );
  }
}
