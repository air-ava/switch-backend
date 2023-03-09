import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { STATUSES } from '../models/status.model';

export class addSettlementTable1677725156690 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'settlementTransactions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'processor',
            type: 'varchar',
            default: `'BEYONIC'`,
            isNullable: false,
          },
          {
            name: 'processor_transaction_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'response',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'tx_reference',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'tx_count',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'bankId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'int',
            default: STATUSES.SUCCESS,
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
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('settlementTransactions');
  }
}
