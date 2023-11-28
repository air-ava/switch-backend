import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const tableData = {
  school_id: new TableColumn({
    name: 'school_id',
    type: 'int',
    isNullable: false,
  }),
  referenced_entity: new TableColumn({
    name: 'referenced_entity',
    type: 'varchar',
    length: '255',
    isNullable: false,
    default: `'school'`,
  }),
};
const { school_id, referenced_entity } = tableData;

export class AddColumnsToDocument1701139998880 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('documents', [school_id, referenced_entity]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('documents', [school_id, referenced_entity]);
  }
}
