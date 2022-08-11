import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const columnsToChanges = {
  updated_at: {
    oldColumn: new TableColumn({
      name: 'updated_at',
      type: 'timestamp',
      default: 'NOW()',
      isNullable: false,
    }),
    newColumn: new TableColumn({
      name: 'updated_at',
      type: 'timestamp',
      isNullable: true,
    }),
  },
};
const { updated_at } = columnsToChanges;
export class addEnableColumnToUserTable1660174536915 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('users', [new TableColumn({ name: 'phone_number', type: 'varchar' })]);
    await queryRunner.changeColumns('users', [updated_at]);
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'enabled',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
      new TableColumn({
        name: 'other_name',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'phone_number',
        type: 'int',
        isNullable: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('users', [{ oldColumn: updated_at.newColumn, newColumn: updated_at.oldColumn }]);
    await queryRunner.dropColumns('users', [
      new TableColumn({ name: 'enabled', type: 'boolean' }),
      new TableColumn({ name: 'other_name', type: 'varchar' }),
      new TableColumn({
        name: 'phone_number',
        type: 'int',
      }),
    ]);
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'phone_number',
        type: 'varchar',
        isUnique: true,
        isNullable: false,
      }),
    ]);
  }
}
