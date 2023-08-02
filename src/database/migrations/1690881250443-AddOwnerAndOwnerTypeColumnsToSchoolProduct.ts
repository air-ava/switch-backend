import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOwnerAndOwnerTypeColumnsToSchoolProduct1690881250443 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'school_product',
      new TableColumn({
        name: 'owner',
        type: 'int',
        isNullable: true, // You can set this to false if owner is required
      }),
    );

    await queryRunner.addColumn(
      'school_product',
      new TableColumn({
        name: 'owner_type',
        type: 'varchar',
        length: '255',
        isNullable: true, // You can set this to false if owner_type is required
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('school_product', 'owner');
    await queryRunner.dropColumn('school_product', 'owner_type');
  }
}
