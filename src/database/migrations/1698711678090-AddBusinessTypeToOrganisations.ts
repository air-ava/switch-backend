import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBusinessTypeToOrganisations1698711678090 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('organisations', [
      new TableColumn({
        name: 'business_type',
        type: 'varchar',
        isNullable: true,
      }),
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
        name: 'onboarding_status',
        type: 'int',
        default: 11,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('organisations', ['onboarding_reference', 'onboarding_status', 'document_reference', 'business_type']);
  }
}
