import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'questions',
    column: '`question`, `title_id`, `type`',
    rows: [
      `'recieving school fees', 1, 'checkbox'`,
      `'payroll and salary advance', 1, 'checkbox'`,
      `'asset financing', 1, 'checkbox'`,
      `'working capital', 1, 'checkbox'`,
      `'paying suppliers', 1, 'checkbox'`,
      `'We are a new business or unsure of our funding', 2, 'radio'`,
      `'We run a stable business with steady cash', 2, 'radio'`,
    ],
  },
];

export class seedQuestionsTable1679269322691 implements MigrationInterface {
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
