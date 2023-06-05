import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddProductTypeIdToSchoolProduct1685757322218 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'school_product',
      new TableColumn({
        name: 'product_type_id',
        type: 'int',
        default: 1,
      }),
    );

    await queryRunner.createForeignKey(
      'school_product',
      new TableForeignKey({
        columnNames: ['product_type_id'],
        referencedTableName: 'product_type',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'school_product',
      new TableForeignKey({
        columnNames: ['payment_type_id'],
        referencedTableName: 'paymentType',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table: any = await queryRunner.getTable('school_product');
    const foreignKey = table.foreignKeys.find((fk: any) => fk.columnNames.includes('productTypeId'));
    await queryRunner.dropForeignKey('school_product', foreignKey);
    await queryRunner.dropColumn('school_product', 'productTypeId');
  }
}
