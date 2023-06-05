import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'product_type',
    column: '`name`, `slug`, `description`, `code`',
    codePrefix: 'prt_',
    rows: [
      `'Tuition', 'tuition', 'Fee for educational instruction and access to academic resources.', '3'`,
      `'Uniform', 'uniform', 'Fee for the mandatory clothing or attire required by the school.', '1'`,
      `'School bus', 'school bus', 'Fee for transportation services provided by the school.', '2'`,
      `'Pta', 'pta', 'Fee for joining the Parent-Teacher Association, supporting school initiatives and parent involvement.', '4'`,
      `'Club fees', 'club fees', 'Fee for participating in extracurricular clubs or activities.', '5'`,
      `'Books', 'books', 'Fee for textbooks or other educational materials.', '6'`,
      `'Lab fees', 'lab fees', 'Fee for access to laboratory facilities and equipment.', '7'`,
      `'Exam fees', 'exam fees', 'Fee for taking examinations or tests.', '8'`,
      `'School registration fees', 'school registration fees', 'Fee for enrolling or registering at the school.', '9'`,
      `'Course registration fees', 'course registration fees', 'Fee for registering in specific courses or classes.', '10'`,
      `'Sport fees', 'sport fees', 'Fee for participating in sports activities or teams.', '11'`,
      `'Excursion fees', 'excursion fees', 'Fee for organized trips or outings for educational or recreational purposes.', '12'`,
      `'Meal fees', 'meal fees', 'Fee for school meals or cafeteria services, if the school offers a lunch program.', '13'`,
    ],
  },
];

export class seedIntoProductType1685755729011 implements MigrationInterface {
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
