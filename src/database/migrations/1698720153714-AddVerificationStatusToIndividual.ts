import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddVerificationStatusToIndividual1698720153714 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('individual', [
      new TableColumn({
        name: 'onboarding_reference',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'document_reference',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'verification_status',
        type: 'int',
        default: 11,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('organisations', ['onboarding_reference', 'verification_status', 'document_reference']);
  }
}
