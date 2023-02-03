import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addColunmsToSchoolTable1675295586831 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns('schools', [
      {
        oldColumn: new TableColumn({
          name: 'country',
          type: 'varchar',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'country',
          type: 'varchar',
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'state',
          type: 'varchar',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'state',
          type: 'varchar',
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: 'education_level',
          type: 'varchar',
          isNullable: false,
        }),
        newColumn: new TableColumn({
          name: 'education_level',
          type: 'varchar',
          isNullable: true,
        }),
      },
    ]);

    await queryRunner.addColumns('schools', [
      new TableColumn({
        name: 'address_id',
        type: 'int',
        isNullable: true,
      }),
      new TableColumn({
        name: 'phone_number',
        type: 'int',
        isNullable: true,
      }),
      new TableColumn({
        name: 'email',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'description',
        type: 'varchar',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return Promise.resolve();
  }
}
