import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCountryToCurrencies1695740008516 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the 'country' column to the 'currencies' table
    await queryRunner.addColumn(
      'currencies',
      new TableColumn({
        name: 'country',
        type: 'varchar',
        length: '255',
        isNullable: false,
      }),
    );

    // Update 'country' values based on 'short_code'
    await queryRunner.query(`
          UPDATE currencies
          SET country =
            CASE
              WHEN short_code = 'USD' THEN 'UNITED_STATES'
              WHEN short_code = 'EUR' THEN 'EUROPE'
              WHEN short_code = 'NGN' THEN 'NIGERIA'
              WHEN short_code = 'KES' THEN 'KENYA'
              WHEN short_code = 'UGX' THEN 'UGANDA'
              WHEN short_code = 'ZAR' THEN 'SOUTH_AFRICA'
              WHEN short_code = 'GHS' THEN 'GHANA'
              WHEN short_code = 'CAD' THEN 'CANADA'
              WHEN short_code = 'GBP' THEN 'UNITED_KINGDOM'
              WHEN short_code = 'CFA' THEN 'FRANCOPHONE_AFRICA'
              ELSE 'Unknown'
            END;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // In case you want to reverse this migration, you can remove the 'country' column
    await queryRunner.dropColumn('currencies', 'country');
  }
}
