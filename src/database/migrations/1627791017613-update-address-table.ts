import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class updateAddressTable1627791017613 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'addresses',
      'userId',
      new TableColumn({
        name: 'userId',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
