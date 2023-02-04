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
            isNullable: false,
          },
          {
            name: 'user_type',
            type: 'enum',
            enum: ['sponsor', 'partner', 'scholar', 'steward', 'school', 'vendor'],
            default: 'school',
            isNullable: false,
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
            isNullable: false,
          },
          {
            name: 'remember_token',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'image',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'phone_number',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'organisation',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'address_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'email_verified_at',
            type: 'timestamp',
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
