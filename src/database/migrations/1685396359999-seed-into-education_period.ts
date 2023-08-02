import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'education_period',
    column: '`rank`, `feature_name`, `level`, `code`',
    codePrefix: 'edp_',
    rows: [
      `1, 'first_term', 'First term', '1'`,
      `2, 'second_term', 'Second term', '2'`,
      `3, 'third_term', 'Third term', '3'`,
      `1, 'first_semester', 'First Semester', '4'`,
      `2, 'second_semester', 'Second Semester', '5'`,
    ],
  },
];
export class seedIntoEducationPeriod1685396359999 implements MigrationInterface {
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
