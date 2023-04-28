import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'class_level',
    column: 'education_level, class, class_short_name',
    rows: [
      `'Senior', 'Senior 1', 'S1'`,
      `'Senior', 'Senior 2', 'S2'`,
      `'Senior', 'Senior 3', 'S3'`,
      `'Senior', 'Senior 4', 'S4'`,
      `'Senior', 'Senior 5', 'S5'`,
      `'Senior', 'Senior 6', 'S6'`,
    ],
  },
];

export class seedSecondaryClassTable1682672187219 implements MigrationInterface {
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
