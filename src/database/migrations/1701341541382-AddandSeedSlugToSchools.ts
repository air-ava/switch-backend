import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const tableName = 'schools';
const columnDetails = {
  name: 'slug',
  type: 'varchar',
  length: '255',
};

const inputLength = 10;

export class AddSlugToSchools1701341541382 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(tableName, new TableColumn({ ...columnDetails, isNullable: false }));

    await queryRunner.manager
      .createQueryBuilder()
      .update(tableName)
      .set({ slug: () => `SUBSTRING(REPLACE(UUID(), '-', ''), 1, ${inputLength})` })
      .execute();

    await queryRunner.changeColumns(tableName, [
      {
        oldColumn: new TableColumn({ ...columnDetails, isNullable: true }),
        newColumn: new TableColumn({ ...columnDetails, isNullable: false, isUnique: true }),
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(tableName, columnDetails.name);
  }
}
