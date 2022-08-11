import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

const columnsToChanges = {
  logo: {
    oldColumn: new TableColumn({
      name: 'logo',
      type: 'varchar',
      isNullable: false,
    }),
    newColumn: new TableColumn({
      name: 'logo',
      type: 'int',
      isNullable: false,
    }),
  },
};

const columns = {
  avatar: new TableColumn({
    name: 'avatar',
    type: 'int',
    isNullable: true,
  }),
};

const foreignKeys = {
  avatarId: new TableForeignKey({
    columnNames: ['avatar'],
    referencedTableName: 'image',
    referencedColumnNames: ['id'],
  }),
  logoId: new TableForeignKey({
    columnNames: ['logo'],
    referencedTableName: 'image',
    referencedColumnNames: ['id'],
  }),
  owner: new TableForeignKey({
    columnNames: ['owner'],
    referencedTableName: 'users',
    referencedColumnNames: ['id'],
  }),
  phone_number: new TableForeignKey({
    columnNames: ['phone_number'],
    referencedTableName: 'phone_numbers',
    referencedColumnNames: ['id'],
  }),
};

const { avatar } = columns;
const { logo } = columnsToChanges;
const { logoId, owner, phone_number, avatarId } = foreignKeys;

export class changeAndAddColunmToBusinessAndUserTable1660225702912 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('business', [logo]);
    await queryRunner.addColumns('users', [avatar]);
    await queryRunner.createForeignKeys('business', [logoId, owner, phone_number]);
    await queryRunner.createForeignKeys('users', [avatarId, phone_number]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('business', [{ oldColumn: logo.newColumn, newColumn: logo.oldColumn }]);
    await queryRunner.dropColumns('users', [avatar]);
    await queryRunner.dropForeignKeys('business', [logoId, owner, phone_number]);
    await queryRunner.dropForeignKeys('users', [avatarId, phone_number]);
  }
}
