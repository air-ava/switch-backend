import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'backOfficeBanks',
    column: '`bank_name`, `account_name`, `number`, `currency`',
    rows: [
      `'Stanbic Bank Uganda Ltd', 'Steward Communication Systems Uganda Ltd', '9030020780842', 'USD'`,
      `'Stanbic Bank Uganda Ltd', 'Steward Communication Systems Uganda Ltd', '9030020780532', 'UGX'`,
      `'Mercury', 'Steward Global Technologies Inc', '202246157800', 'USD'`,
    ],
  },
];

export class seedBankDetailsIntoBackOfficeBanks1680744137740 implements MigrationInterface {
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
