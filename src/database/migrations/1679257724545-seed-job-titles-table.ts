import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'job_titles',
    column: 'name',
    rows: [`'CEO'`, `'CFO'`, `'COO'`, `'Founder'`, `'President'`, `'Managing Director'`, `'General Partner'`, `'Other'`],
  },
];

export class seedJobTitlesTable1679257724545 implements MigrationInterface {
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
