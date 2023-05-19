import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class CreateStudentGuardianTable1684372625499 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create 'studentGuardian' table
    await queryRunner.createTable(
      new Table({
        name: 'studentGuardian',
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
            type: 'varchar', // Adjust the column type based on your requirements
            length: '21', // Set the length to accommodate "ind_" + 17 characters
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'studentId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'individualId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'relationship',
            type: 'varchar', // Adjust the column type based on your requirements
            length: '20', // Adjust the length as needed
            isNullable: false,
          },
        ],
      }),
    );

    // Add indexes
    await queryRunner.createForeignKey(
      'studentGuardian',
      new TableForeignKey({
        columnNames: ['studentId'],
        referencedTableName: 'students',
        referencedColumnNames: ['id'],
      }),
    );

    await queryRunner.createForeignKey(
      'studentGuardian',
      new TableForeignKey({
        columnNames: ['individualId'],
        referencedTableName: 'individual',
        referencedColumnNames: ['id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop 'studentGuardian' table
    await queryRunner.dropTable('studentGuardian');
  }
}
