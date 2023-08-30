import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLoanActivityTable1693358104775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'loan_activities',
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
            isNullable: false,
          },
          {
            name: 'entity',
            type: 'varchar',
            isNullable: false,
            default: "'loan'",
          },
          {
            name: 'entityId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'stage',
            type: 'varchar',
            isNullable: false,
            default: "'Application'",
          },
          {
            name: 'responsibleParty',
            type: 'varchar',
            isNullable: false,
            default: "'school'",
          },
          {
            name: 'responsiblePartyId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'int',
            isNullable: false,
            default: 20,
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
    await queryRunner.dropTable('loan_activities');
  }
}
