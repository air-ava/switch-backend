import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import randomstring from 'randomstring';

const seedData = [
  {
    name: 'paymentType',
    column: 'code, value, name',
    rows: [
      `'pty_${randomstring.generate({
        length: 17,
        capitalization: 'lowercase',
        charset: 'alphanumeric',
      })}', 'install-mental', 'Installmental Payment'`,
      `'pty_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}', 'lump-sum', 'Lump Sum Payment'`,
      `'pty_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}', 'no-payment', 'No Payment'`,
    ],
  },
];

export class CreatePaymentTypeTable1684456448899 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'paymentType',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'code',
            type: 'varchar', // Adjust the column type based on your requirements
            length: '21', // Set the length to accommodate "ind_" + 17 characters
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'value',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
    );

    await Promise.all(
      seedData.map((seed) => seed.rows.map((value) => queryRunner.query(`INSERT INTO ${seed.name} (${seed.column}) VALUES (${value})`))),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('paymentType');
  }
}
