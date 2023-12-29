import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const seedData = [
  {
    name: 'reserved_accounts',
    codePrefix: 'rsa_',
  },
];
const columnDetails = {
  name: 'code',
  type: 'varchar',
  length: '255',
};

export class AddandSeedToReservedAccounts1703203375262 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(seedData[0].name, new TableColumn({ ...columnDetails, isNullable: false }));
    await queryRunner.query(`UPDATE ${seedData[0].name} SET code = CONCAT('${seedData[0].codePrefix}', SUBSTRING(REPLACE(UUID(), '-', ''), 1, 17))`);
    await queryRunner.changeColumns(seedData[0].name, [
      {
        oldColumn: new TableColumn({ ...columnDetails, isNullable: true }),
        newColumn: new TableColumn({ ...columnDetails, isNullable: false }),
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(seedData[0].name, 'code');
  }
}
