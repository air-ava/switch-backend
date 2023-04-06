import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const tableData = {
  verify: new TableColumn({
    name: 'verified_at',
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    isNullable: true,
  }),
  token: new TableColumn({
    name: 'remember_token',
    type: 'varchar',
    isNullable: true,
  }),
};

const { verify, token } = tableData;

export class addVerifiedAtAndTokenToPhoneNumberTable1680220535784 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('phone_numbers', [verify, token]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('phone_numbers', [verify, token]);
  }
}
