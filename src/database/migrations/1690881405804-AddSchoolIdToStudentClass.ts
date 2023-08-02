import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSchoolIdToStudentClass1690881405804 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'student_class',
      new TableColumn({
        name: 'school_id',
        type: 'int',
        isNullable: true, // You can set this to false if school_id is required
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('student_class', 'school_id');
  }
}
