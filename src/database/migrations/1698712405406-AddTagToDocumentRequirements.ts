import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTagToDocumentRequirements1698712405406 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('document_requirements', [
      new TableColumn({
        name: 'tag',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'verification_type',
        type: 'varchar',
        length: '255',
        default: "'AUTO'",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('document_requirements', 'tag');
  }
}
