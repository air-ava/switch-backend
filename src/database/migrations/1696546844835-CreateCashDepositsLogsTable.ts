import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCashDepositsLogsTable1696546844835 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cash_deposits_logs',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'code', type: 'varchar', isUnique: true },
          { name: 'cash_deposits_id', type: 'int' },
          { name: 'initiator_id', type: 'varchar', collation: 'utf8mb4_unicode_ci' },
          { name: 'device_id', type: 'int' },
          { name: 'action', type: 'varchar', default: "'CREATED'" }, // 'CREATED', 'UPDATED', 'DELETED', 'COMPLETED', 'SUBMITED'
          { name: 'state_before', type: 'text', isNullable: true },
          { name: 'state_after', type: 'text', isNullable: true },
          { name: 'longitude', type: 'varchar', isNullable: true },
          { name: 'latitude', type: 'varchar', isNullable: true },
          { name: 'ip_address', type: 'varchar' },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', isNullable: true },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cash_deposits_logs');
  }
}
