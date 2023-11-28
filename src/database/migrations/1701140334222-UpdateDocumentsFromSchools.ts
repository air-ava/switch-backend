import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocumentsFromSchools1701140334222 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE documents 
            SET school_id = schools.id, 
                referenced_entity = 'schools'
            FROM schools 
            WHERE documents.reference = schools.document_reference
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Write the reverse logic if necessary
  }
}
