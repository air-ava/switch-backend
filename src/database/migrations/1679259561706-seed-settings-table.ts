/* eslint-disable no-useless-escape */
import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'settings',
    column: '`key`, `value`',
    rows: [`'EDUCATIOAL_LEVEL', '{\"level\": [\"Nursery\", \"Primary\", \"Secondary\", \"Post Secondary\", \"Post Graduate\"]}'`],
  },
];

export class seedSettingsTable1679259561706 implements MigrationInterface {
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
