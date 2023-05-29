import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCodeColumnToClassLevel1685320598606 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'class_level',
      new TableColumn({
        name: 'code',
        type: 'varchar',
        length: '21',
        isNullable: true,
      }),
    );

    await queryRunner.query(`
            UPDATE class_level
            SET code = CONCAT('cll_', SUBSTRING(REPLACE(UUID(), '-', ''), 1, 17))
        `);

    await queryRunner.changeColumn(
      'class_level',
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
    await queryRunner.dropColumn('class_level', 'code');
  }
}
