import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    codePrefix: 'shs_',
    name: 'school_session',
    column: `'session', 'country', 'schedule_id', 'name', 'status', 'start_date', 'expiry_date', 'education_level'`,
    rows: [
      `'2022/2023', 'UGANDA', 11, '2022/2023', 1, null, '2023-12-01', 'Primary'`,
      `'2022/2023', 'UGANDA', 12, '2022/2023', 10, null, '2023-12-01', 'Nursery'`,
      `'2022/2023', 'UGANDA', 13, '2022/2023', 10, null, '2023-12-01', 'Secondary'`,
      `'2022/2023', 'UGANDA', 14, '2022/2023', 10, null, '2023-12-01', 'Post Secondary'`,
      `'2022/2023', 'UGANDA', 15, '2022/2023', 10, null, '2023-12-01', 'Post Graduate'`,
    ],
  },
];

export class SeedDataIntoSchoolSession1691016527577 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      seedData.map((seed) => seed.rows.map((value) => queryRunner.query(`INSERT INTO ${seed.name} (${seed.column}) VALUES (${value})`))),
    );
    await queryRunner.query(`UPDATE ${seedData[0].name} SET code = CONCAT('${seedData[0].codePrefix}', SUBSTRING(REPLACE(UUID(), '-', ''), 1, 17))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      seedData.map((seed) => seed.rows.map((value) => queryRunner.query(`DELETE FROM ${seed.name} WHERE ${seed.column}='${value}';`))),
    );
  }
}
