import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocumentsFromIndividual1701140407437 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE documents
            JOIN individual ON documents.reference = individual.document_reference
            SET documents.school_id = individual.school_id,
            documents.referenced_entity = 'individual';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Write the reverse logic if necessary
  }
}

// UPDATE documents
// SET school_id = individual.school_id,
//     referenced_entity = 'individual'
// FROM individual
// WHERE documents.reference = individual.document_reference
