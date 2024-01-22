import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class updateReservedAccountTable1705885825186 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('reserved_accounts', [
      new TableColumn({
        name: 'reason',
        type: 'varchar',
        length: '255',
        isNullable: true, // Optional based on your requirement
      }),
      new TableColumn({
        name: 'blocked_by',
        type: 'varchar',
        length: '255',
        isNullable: true, // Optional based on your requirement
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('reserved_accounts', 'reason');
    await queryRunner.dropColumn('reserved_accounts', 'blocked_by');
  }
}
