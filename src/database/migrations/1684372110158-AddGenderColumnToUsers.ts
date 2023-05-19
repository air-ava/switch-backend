import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGenderColumnToUsers1684372110158 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'gender' column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'gender',
        type: 'enum', // Use an enumeration type for gender
        enum: ['male', 'female', 'others'],
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove 'gender' column
    await queryRunner.dropColumn('users', 'gender');
  }
}
