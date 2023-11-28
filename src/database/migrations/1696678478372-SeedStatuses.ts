import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'statuses',
    column: '`value`',
    rows: [`'LOGGED'`, `'RESOLVED'`, `'UNRESOLVED'`, `INCOMPLETE`],
  },
];

export class SeedStatuses1696678478372 implements MigrationInterface {
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
