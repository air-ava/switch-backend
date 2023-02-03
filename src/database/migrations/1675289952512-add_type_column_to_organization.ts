import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addTypeColumnToOrganization1675289952512 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('organisations', [
      new TableColumn({
        name: 'type',
        type: 'varchar',
        isNullable: false,
        default: "'school'",
      }),
    ]);
    await queryRunner.addColumns('schools', [
      new TableColumn({
        name: 'organisation_id',
        type: 'int',
        isNullable: false,
        default: 5,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('organisations', [new TableColumn({ name: 'type', type: 'text' })]);
    await queryRunner.dropColumns('schools', [new TableColumn({ name: 'organisation_id', type: 'int' })]);
  }
}
