import { MigrationInterface, QueryRunner } from 'typeorm';
// seedStatusTable1679263180227
const seedData = [
  {
    name: 'statuses',
    column: 'value',
    rows: [
      `'ACTIVE'`,
      `'INACTIVE'`,
      `'PAUSE'`,
      `'FREEZE'`,
      `'BLOCKED'`,
      `'VERIFIED'`,
      `'UNVERIFIED'`,
      `'INVITED'`,
      `'CANCELLED'`,
      `'DELETED'`,
      `'PENDING'`,
      `'APPROVED'`,
      `'REJECTED'`,
      `'SUCCESS'`,
      `'FAILED'`,
      `'DECLINED'`,
      `'PAID'`,
      `'PROCESSING'`,
      `'PROCESSED'`,
      `'INITIATED'`,
      `'COMPLETED'`,
      `'NEW'`,
    ],
  },
];

export class seedStatusTable1679263180227 implements MigrationInterface {
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
