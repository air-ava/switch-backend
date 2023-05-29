import randomstring from 'randomstring';
import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'education_level',
    column: 'feature_name, name, code',
    codePrefix: 'edl_',
    rows: [
      `'nursery', 'Nursery', '1'`,
      `'primary', 'Primary', '2'`,
      `'secondary', 'Secondary', '3'`,
      `'post_secondary', 'Post Secondary', '4'`,
      `'post_graduate', 'Post Graduate', '5'`,
    ],
  },
];

export class seedIntoEducationLevel1685383331371 implements MigrationInterface {
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
