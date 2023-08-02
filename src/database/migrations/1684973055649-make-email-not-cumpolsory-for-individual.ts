import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class makeEmailNotCumpolsoryForIndividual1684973055649 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'individual',
      'email',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        isNullable: true, // Set the column as nullable
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'individual',
      'email',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        isNullable: false, // Set the column as non-nullable
      }),
    );
  }
}
