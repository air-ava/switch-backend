import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class creatPhoneNumbersTable1679256561387 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'phone_numbers',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'countryCode',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'localFormat',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'internationalFormat',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
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
    await queryRunner.dropTable('phone_numbers');
  }
}
