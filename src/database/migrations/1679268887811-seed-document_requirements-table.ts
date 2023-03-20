import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'document_requirements',
    column: '`requirement_type`, `required`, `type`, `name`, `process`, `status`, `country`, `description`',
    rows: [
      `'file', 1, 'NID', 'Directors National I.D. Cards (Coloured copies only) ', 'onboarding', 1, 'UGANDA', 'National identification of director'`,
      `'file', 0, 'EDUCATION-LICENSE', 'Ministry of Education License (optional)', 'onboarding', 1, 'UGANDA', 'License From the Ministry of Education'`,
      `'text', 1, 'TIN', 'Tax Identification Number', 'onboarding', 1, 'UGANDA', 'TIN number from URA certificate'`,
      `'file', 1, 'URA', 'URA Pin certificate ', 'onboarding', 1, 'UGANDA', 'Tax certificate'`,
      `'file', 0, 'CERT-INC', 'Certificate of incorporation (optional)', 'onboarding', 1, 'UGANDA', 'This can be gotten from Uganda Registration Service Bureau(URSB)'`,
      `'file', 1, 'OP-LICENSE', 'Operating License', 'onboarding', 1, 'UGANDA', 'Operating license'`,
      `'file', 1, 'UTILITY', 'Copy of Utility Bill or Business Photo', 'onboarding', 1, 'UGANDA', 'Utility Bill for school address of director or picture of school'`,
    ],
  },
];

export class seedDocumentRequirementsTable1679268887811 implements MigrationInterface {
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
