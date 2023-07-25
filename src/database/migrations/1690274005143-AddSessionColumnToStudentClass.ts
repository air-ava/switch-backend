import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSessionColumnToStudentClass1690274005143 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'student_class',
      new TableColumn({
        name: 'session',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('student_class', 'session');
  }
}
