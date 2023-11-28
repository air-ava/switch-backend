import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocumentsFromTransaction1701140478670 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE documents 
            SET school_id = wallets.entity_id, 
                referenced_entity = 'transactions'
            FROM transactions 
            JOIN wallets ON transactions.walletId = wallets.id 
            WHERE documents.reference = transactions.document_reference
            AND wallets.entity = 'school'
            LIMIT 1
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Write the reverse logic if necessary
  }
}
