import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocumentsFromTransaction1701140478670 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          UPDATE documents
          JOIN transactions ON documents.reference = transactions.document_reference
          JOIN wallets ON transactions.walletId = wallets.id
          SET documents.school_id = wallets.entity_id,
              documents.referenced_entity = 'transactions'
          WHERE wallets.entity = 'school'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Write the reverse logic if necessary
  }
}
// UPDATE documents
// SET school_id = wallets.entity_id,
//     referenced_entity = 'transactions'
// FROM transactions
// JOIN wallets ON transactions.walletId = wallets.id
// WHERE documents.reference = transactions.document_reference
// AND wallets.entity = 'school'
// LIMIT 1
