import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const tableData = {
  addStatus: new TableColumn({
    name: 'status',
    type: 'int',
    default: 7,
    isNullable: false,
  }),
};

const { addStatus } = tableData;

export class addStatusToUserTable1680219065077 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [addStatus]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('users', [addStatus]);
  }
}
