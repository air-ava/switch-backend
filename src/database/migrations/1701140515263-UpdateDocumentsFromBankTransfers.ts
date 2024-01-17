import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocumentsFromBankTransfers1701140515263 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          UPDATE documents
          JOIN bankTransfers ON documents.reference = bankTransfers.document_reference
          JOIN wallets ON bankTransfers.walletId = wallets.id
          SET documents.school_id = wallets.entity_id,
              documents.referenced_entity = 'bankTransfers'
          WHERE wallets.entity = 'school'    
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Write the reverse logic if necessary
  }
}
// UPDATE documents
// SET school_id = wallets.entity_id,
//     referenced_entity = 'bankTransfers'
// FROM bankTransfers
// JOIN wallets ON bankTransfers.walletId = wallets.id
// WHERE documents.reference = bankTransfers.document_reference
// AND wallets.entity = 'school'
