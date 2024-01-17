import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const tableName = 'individual';
const columnDetails = {
  name: 'username',
  type: 'varchar',
  length: '255',
};
const setObject: any = {};
const inputLength = 8;

export class AddandSeedUsernameToIndividual1701341915328 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(tableName, new TableColumn({ ...columnDetails, isNullable: false }));

    await queryRunner.manager
      .createQueryBuilder()
      .update(tableName)
      .set({ username: () => `SUBSTRING(REPLACE(UUID(), '-', ''), 1, ${inputLength})` })
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
