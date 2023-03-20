import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createOrganisationsTable1679257971599 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'organisations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'logo',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'owner',
            type: 'varchar',
            isNullable: true,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'slug',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'headline',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'social',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'size',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'industry',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: true,
            default: "'school'",
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
    await queryRunner.dropTable('organisations');
  }
}
