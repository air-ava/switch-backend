import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateReservedAccountsTable1702678082209 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'reserved_accounts',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'reserved_account_number', type: 'varchar', isNullable: false, isUnique: true },
        { name: 'reserved_account_name', type: 'varchar', isNullable: false },
        { name: 'reserved_bank_name', type: 'varchar', default: `'Wema Bank'`, isNullable: false },
        { name: 'processor', type: 'varchar', default: `'WEMA'`, isNullable: false },
        { name: 'status', type: 'int', default: 1, isNullable: false },
        { name: 'entity', type: 'varchar', default: `'wallet'` },
        { name: 'entity_id', type: 'int', isNullable: false },
        { name: 'wallet_id', type: 'int', isNullable: false },
        { name: 'type', type: 'varchar', default: `'permanent'` },
        { name: 'country', type: 'varchar', default: `'NIGERIA'` },
        { name: 'reserved_bank_code', type: 'varchar', isNullable: true },
        { name: 'is_default', type: 'bool', default: false },
        { name: 'expired_at', type: 'datetime', isNullable: true },
        { name: 'deleted_at', type: 'datetime', isNullable: true },
        { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'datetime', isNullable: true },
      ],
    });

    await queryRunner.createTable(table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reserved_accounts');
  }
}
