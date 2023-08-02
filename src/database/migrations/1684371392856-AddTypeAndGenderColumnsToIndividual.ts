/* eslint-disable no-plusplus */
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTypeAndGenderColumnsToIndividual1684371392856 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'code' column
    await queryRunner.addColumn(
      'individual',
      new TableColumn({
        name: 'code',
        type: 'varchar', // Adjust the column type based on your requirements
        length: '21', // Set the length to accommodate "ind_" + 17 characters
        isUnique: true,
        isNullable: true,
      }),
    );
    // Add 'type' column
    await queryRunner.addColumn(
      'individual',
      new TableColumn({
        name: 'type',
        type: 'varchar', // Adjust the column type based on your requirements
        default: "'director'", // Set the default value to 'director'
        isNullable: false,
      }),
    );

    // Add 'gender' column
    await queryRunner.addColumn(
      'individual',
      new TableColumn({
        name: 'gender',
        type: 'enum', // Use an enumeration type for gender
        enum: ['male', 'female', 'others'],
        isNullable: true,
      }),
    );

    await queryRunner.query(`
            UPDATE individual
            SET code = CONCAT('ind_', SUBSTRING(REPLACE(UUID(), '-', ''), 1, 17))
        `);

    await queryRunner.changeColumn(
      'individual',
      'code',
      new TableColumn({
        name: 'code',
        type: 'varchar',
        length: '21',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove 'type' column
    await queryRunner.dropColumn('individual', 'type');

    // Remove 'gender' column
    await queryRunner.dropColumn('individual', 'gender');

    await queryRunner.changeColumn(
      'individual',
      'code',
      new TableColumn({
        name: 'code',
        type: 'varchar',
        length: '21',
        isNullable: true,
        default: '',
      }),
    );
  }
}
