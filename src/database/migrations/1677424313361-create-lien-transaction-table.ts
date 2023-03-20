import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { STATUSES } from '../models/status.model';

export class createLienTransactionTable1677424313361 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lien_transaction',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'amount',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'int',
            default: STATUSES.ACTIVE,
            isNullable: false,
          },
          {
            name: 'walletId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'reference',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            default: `'collection-request'`,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: true,
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('lien_transaction');
  }
}
