import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'questionnaire_title',
    column: '`title`, `trigger`',
    rows: [
      `'What will you use your Steward account for?', 'onboarding'`,
      `'What is the current state of the business of your school ?', 'onboarding'`,
    ],
  },
];

export class seedQuestionsTitleTable1679269516743 implements MigrationInterface {
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
