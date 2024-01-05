import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBanksTable1704373279771 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'banks',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'code', type: 'varchar', isNullable: false },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'bank_code', type: 'varchar', isNullable: false },
          { name: 'country', type: 'varchar', default: "'NIGERIA'" },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', isNullable: true },
          { name: 'wema_data', type: 'json', isNullable: true },
          { name: 'logo_url', type: 'text', isNullable: true },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('banks');
  }
}
