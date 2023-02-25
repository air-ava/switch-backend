import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'class_level',
    column: 'education_level, class, class_short_name',
    rows: [
      `'Primary', 'Primary 1', 'P1'`,
      `'Primary', 'Primary 2', 'P2'`,
      `'Primary', 'Primary 3', 'P3'`,
      `'Primary', 'Primary 4', 'P4'`,
      `'Primary', 'Primary 5', 'P5'`,
      `'Primary', 'Primary 6', 'P6'`,
      `'Primary', 'Primary 7', 'P7'`,
      `'Nursery', 'Baby Class', 'BC'`,
      `'Nursery', 'Middle Class', 'MC'`,
      `'Nursery', 'Top Class', 'TC'`,
    ],
  },
];

export class seedClassTable1677302048961 implements MigrationInterface {
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
