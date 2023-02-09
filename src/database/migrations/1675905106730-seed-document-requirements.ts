import { MigrationInterface, QueryRunner } from 'typeorm';

const seedData = [
  {
    name: 'document_requirements',
    column: 'type, name, description, requirement_type, required',
    features: [
      `'NID', 'National ID', 'The national identification Nymber', 'number', true`,
      `'UTILITY', 'Utility Bill', 'Utility Bill from your home', 'file', true`,
      `'CN', 'Cooperation Number', 'This can be gotten from Uganda Registration Service Bureau(URSB)', 'number', true`,
      `'FORM-80', 'Company form-80', 'This can be gotten from Uganda Registration Service Bureau(URSB)', 'file', true`,
      `'CERT-INC', 'Certificate of incorporation', 'This can be gotten from Uganda Registration Service Bureau(URSB)', 'file', true`,
      `'RETURNS', 'Annual Returns', 'This can be gotten from Uganda Registration Service Bureau(URSB)', 'file', true`,
      `'EDU-LICENSE', 'Education license', 'License From the Ministry of Education', 'file', true`,
    ],
  },
];

export class seedDocumentRequirements1675905106730 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      seedData.map((seed) => seed.features.map((feat) => queryRunner.query(`INSERT INTO ${seed.name} (${seed.column}) VALUES (${feat})`))),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      seedData.map((seed) => seed.features.map((feat) => queryRunner.query(`DELETE FROM ${seed.name} WHERE ${seed.column}='${feat}';`))),
    );
  }
}
