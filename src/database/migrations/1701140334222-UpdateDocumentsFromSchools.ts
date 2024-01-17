import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocumentsFromSchools1701140334222 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    UPDATE documents
    JOIN schools ON documents.reference = schools.document_reference
    SET documents.school_id = schools.id,
    documents.referenced_entity = 'schools'    
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Write the reverse logic if necessary
  }
}
