import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDefaultEmailColumnToStudents1691053772041 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'students',
      new TableColumn({
        name: 'defaultEmail',
        type: 'boolean',
        default: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('students', 'defaultEmail');
  }
}
