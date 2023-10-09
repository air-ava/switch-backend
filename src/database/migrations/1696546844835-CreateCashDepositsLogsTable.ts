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
          { name: 'initiator_id', type: 'varchar' },
          { name: 'device_id', type: 'int' },
          { name: 'action', type: 'enum', enum: ['CREATED', 'UPDATED', 'DELETED', 'COMPLETED'] },
          { name: 'state_before', type: 'text', isNullable: true },
          { name: 'state_after', type: 'text', isNullable: true },
          { name: 'longitude', type: 'varchar', isNullable: true },
          { name: 'latitude', type: 'varchar', isNullable: true },
          { name: 'ip_address', type: 'varchar' },
          { name: 'created_at', type: 'date', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'date', isNullable: true },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cash_deposits_logs');
  }
}
