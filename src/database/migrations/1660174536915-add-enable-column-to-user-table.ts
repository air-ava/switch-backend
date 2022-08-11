import { MigrationInterface, QueryRunner, TableColumn, TableUnique } from 'typeorm';

const columnsToChanges = {
  phone_number: {
    oldColumn: new TableColumn({
      name: 'phone_number',
      type: 'varchar',
      isNullable: false,
    }),
    newColumn: new TableColumn({
      name: 'phone_number',
      type: 'int',
      isNullable: false,
    }),
  },
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
const phoneUniqueKey = new TableUnique({
  columnNames: ['phone_number'],
});
const { phone_number, updated_at } = columnsToChanges;
export class addEnableColumnToUserTable1660174536915 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint('users', phoneUniqueKey);
    await queryRunner.changeColumns('users', [phone_number, updated_at]);
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
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint('users', phoneUniqueKey);
    await queryRunner.changeColumns('users', [
      { oldColumn: phone_number.newColumn, newColumn: phone_number.oldColumn },
      { oldColumn: updated_at.newColumn, newColumn: updated_at.oldColumn },
    ]);
    await queryRunner.dropColumns('users', [
      new TableColumn({ name: 'enabled', type: 'boolean' }),
      new TableColumn({ name: 'other_name', type: 'varchar' }),
    ]);
  }
}
