import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePreferenceTable1687106341868 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'preferences',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '21',
            isUnique: true,
          },
          {
            name: 'entity',
            type: 'varchar',
          },
          {
            name: 'entity_id',
            type: 'int',
          },
          {
            name: 'configuration',
            type: 'json',
          },
          {
            name: 'status',
            type: 'int',
            default: 1,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
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
    await queryRunner.dropTable('preferences');
  }
}
