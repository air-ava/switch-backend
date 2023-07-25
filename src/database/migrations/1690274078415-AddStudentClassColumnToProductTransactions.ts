import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStudentClassColumnToProductTransactions1690274078415 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'product_transactions',
      new TableColumn({
        name: 'student_class',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('product_transactions', 'student_class');
  }
}
