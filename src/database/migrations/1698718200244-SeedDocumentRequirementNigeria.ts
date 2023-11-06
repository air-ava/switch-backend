import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'document_requirements',
    column: '`requirement_type`, `required`, `type`, `name`, `process`, `status`, `country`, `description`, `tag`',
    rows: [
      `'text', 0, 'BN-NUMBER', 'BN Number', 'onboarding', 1, 'NIGERIA', 'Business Number', 'SOLE_PROPITOR'`,
      `'text', 0, 'RC-NUMBER', 'RC Number', 'onboarding', 1, 'NIGERIA', 'Registered Company Number (CAC)', 'LIMITED_LIABILITY'`,
      `'text', 0, 'TIN', 'Tax Identification Number', 'onboarding', 1, 'NIGERIA', 'TIN number from URA certificate', 'SOLE_PROPITOR,LIMITED_LIABILITY'`,
      `'file', 0, 'UTILITY', 'Copy of Utility Bill or Business Photo', 'onboarding', 1, 'NIGERIA', 'Utility Bill for school address of director or picture of school', 'SOLE_PROPITOR,LIMITED_LIABILITY'`,
      `'file', 0, 'BN-DOC', 'Business Number Document', 'onboarding', 1, 'NIGERIA', 'Proof of Business Number', 'SOLE_PROPITOR'`,
      `'file', 0, 'CAC', 'CAC Document', 'onboarding', 1, 'NIGERIA', 'Your CAC Documnent', 'LIMITED_LIABILITY'`,
      `'file', 0, 'CAC-2A', 'CAC 2A Document', 'onboarding', 1, 'NIGERIA', 'Your CAC 2A Documnent', 'LIMITED_LIABILITY'`,
      `'file', 0, 'CAC-7A', 'CAC 7A Document', 'onboarding', 1, 'NIGERIA', 'Your CAC 7A Documnent', 'LIMITED_LIABILITY'`,
      `'file', 0, 'POA', 'Proof of Address', 'onboarding', 1, 'NIGERIA', 'Proof of Address', 'ADDRESS'`,
      `'file', 0, 'DID-DOCUMENT', 'Director ID Document', 'onboarding', 1, 'NIGERIA', 'Director ID Document', 'DIRECTOR'`,
      `'text', 0, 'DID-NUMBER', 'Director ID Number', 'onboarding', 1, 'NIGERIA', 'Director ID Number', 'DIRECTOR'`,
    ],
  },
];
export class SeedDocumentRequirementNigeria1698718200244 implements MigrationInterface {
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
