import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const tableName = 'product_category';
const columnName = 'name';
const categories = ['FASHION', 'COMPUTER', 'FOOD'];

const columnsToChanges = {
  description: {
    oldColumn: new TableColumn({
      name: 'description',
      type: 'varchar',
      isNullable: false,
    }),
    newColumn: new TableColumn({
      name: 'description',
      type: 'varchar',
      isNullable: true,
    }),
  },
  image: {
    oldColumn: new TableColumn({
      name: 'image',
      type: 'int',
      isNullable: false,
    }),
    newColumn: new TableColumn({
      name: 'image',
      type: 'int',
      isNullable: true,
    }),
  },
};

const { description, image } = columnsToChanges;

export class updateDescriptionAndImageProductCategoryTable1660429775068 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('product_category', [image, description]);
    await Promise.all(categories.map((category) => queryRunner.query(`INSERT INTO ${tableName} (${columnName}) VALUES ('${category}')`)));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('product_category', [
      { oldColumn: image.newColumn, newColumn: image.oldColumn },
      { oldColumn: description.newColumn, newColumn: description.oldColumn },
    ]);
    await Promise.all(categories.map((category) => queryRunner.query(`DELETE FROM ${tableName} WHERE ${columnName}='${category}';`)));
  }
}
