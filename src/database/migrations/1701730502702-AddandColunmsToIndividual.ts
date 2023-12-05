import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const tableData = {
  nationality: new TableColumn({
    name: 'nationality',
    type: 'varchar',
    length: '255',
    isNullable: true,
  }),
  is_owner: new TableColumn({
    name: 'is_owner',
    type: 'boolean',
    default: false,
  }),
  dob: new TableColumn({
    name: 'dob',
    type: 'timestamp',
    isNullable: true,
  }),
};
const { nationality, is_owner, dob } = tableData;

export class AddandColunmsToIndividual1701730502702 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('individual', [nationality, is_owner, dob]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('individual', [nationality, is_owner, dob]);
  }
}
