import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameBanksToBankAccounts1704366723869 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('banks', 'bank_accounts');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('bank_accounts', 'banks');
  }
}
