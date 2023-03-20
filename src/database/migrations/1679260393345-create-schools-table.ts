import { MigrationInterface, QueryRunner, Table } from 'typeorm';
// createSchoolsTable1679260393345

export class createSchoolsTable1679260393345 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'schools',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'country',
            type: 'varchar',
            default: `'UGANDA'`,
            isNullable: true,
          },
          {
            name: 'state',
            type: 'varchar',
            default: `'UGANDA'`,
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'education_level',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'website',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'document_reference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'organisation_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'address_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'logo',
            type: 'int',
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
    await queryRunner.dropTable('schools');
  }
}
