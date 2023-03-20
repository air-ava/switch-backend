import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createSocialsTable1679259085962 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'socials',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'link',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'linkId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'varchar',
            isNullable: true,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'organisation',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'entity',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'entity_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'int',
            default: 1,
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
    await queryRunner.dropTable('socials');
  }
}
