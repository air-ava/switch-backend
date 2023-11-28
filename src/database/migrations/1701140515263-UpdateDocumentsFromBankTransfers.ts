import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocumentsFromBankTransfers1701140515263 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE documents 
            SET school_id = wallets.entity_id, 
                referenced_entity = 'bankTransfers'
            FROM bankTransfers 
            JOIN wallets ON bankTransfers.walletId = wallets.id 
            WHERE documents.reference = bankTransfers.document_reference
            AND wallets.entity = 'school'
            LIMIT 1
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Write the reverse logic if necessary
  }
}
