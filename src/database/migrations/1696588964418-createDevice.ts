import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createDevice1696588964418 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'device',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'code', type: 'varchar', isUnique: true },
          { name: 'isMobile', type: 'boolean' },
          { name: 'OS', type: 'varchar', isNullable: true },
          { name: 'name', type: 'varchar' },
          { name: 'model', type: 'varchar' },
          { name: 'device_type', type: 'varchar' },
          { name: 'status', type: 'int', default: 1 },
          { name: 'school_id', type: 'int' },
          { name: 'owner_id', type: 'varchar' },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', isNullable: true },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('device');
  }
}
