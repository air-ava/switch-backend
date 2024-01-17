import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAdministrativeDivisionsTable1702344519950 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'country_states',
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
          },
          {
            name: 'state_district',
            type: 'varchar',
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'postal_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'alpha_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lga_cities',
            type: 'text',
            isNullable: true,
          },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', isNullable: true },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('country_states');
  }
}
