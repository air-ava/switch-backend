import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

const columnsToChanges = {
  image: {
    oldColumn: new TableColumn({
      name: 'image_reference',
      type: 'int',
      isNullable: false,
    }),
    newColumn: new TableColumn({
      name: 'image_reference',
      type: 'varchar',
      isNullable: true,
    }),
  },
  logo: {
    oldColumn: new TableColumn({
      name: 'logo',
      type: 'int',
      isNullable: false,
    }),
    newColumn: new TableColumn({
      name: 'logo',
      type: 'int',
      isNullable: true,
    }),
  },
};

const { logo, image } = columnsToChanges;

export class updateForeignKeyAndTypeOfImageReferenceOnProductTable1660414586660 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('product', [image]);
    await queryRunner.changeColumns('business', [logo]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('product', [{ oldColumn: image.newColumn, newColumn: image.oldColumn }]);
    await queryRunner.changeColumns('business', [{ oldColumn: logo.newColumn, newColumn: logo.oldColumn }]);
  }
}
