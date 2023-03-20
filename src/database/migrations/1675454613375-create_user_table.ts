import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createUserTable1675454613375 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'first_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'other_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: true,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'provider',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'provider_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'job_title',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'user_type',
            type: 'enum',
            enum: ['sponsor', 'partner', 'scholar', 'steward', 'school', 'vendor', 'student'],
            default: `'school'`,
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'slug',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'business_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'organisation_email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'remember_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'organisation',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'address_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'avatar',
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
            name: 'email_verified_at',
            type: 'timestamp',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: true,
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
    await queryRunner.dropTable('users');
  }
}
