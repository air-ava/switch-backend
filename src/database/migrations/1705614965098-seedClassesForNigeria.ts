import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const seedData = [
  {
    name: 'class_level',
    codePrefix: 'cll_',
    column: 'education_level, class, class_short_name, country',
    rows: [
      `'Senior', 'Senior Secondary 1', 'SS1', 'NIGERIA'`,
      `'Senior', 'Senior Secondary 2', 'SS2', 'NIGERIA'`,
      `'Senior', 'Senior Secondary 3', 'SS3', 'NIGERIA'`,
      `'Senior', 'Junior Secondary 1', 'JSS1', 'NIGERIA'`,
      `'Senior', 'Junior Secondary 2', 'JSS2', 'NIGERIA'`,
      `'Senior', 'Junior Secondary 3', 'JSS3', 'NIGERIA'`,
      `'Primary', 'Primary 1', 'PRI1', 'NIGERIA'`,
      `'Primary', 'Primary 2', 'PRI2', 'NIGERIA'`,
      `'Primary', 'Primary 3', 'PRI3', 'NIGERIA'`,
      `'Primary', 'Primary 4', 'PRI4', 'NIGERIA'`,
      `'Primary', 'Primary 5', 'PRI5', 'NIGERIA'`,
      `'Primary', 'Primary 6', 'PRI6', 'NIGERIA'`,
      `'Nursery', 'Playgroup', 'PG', 'NIGERIA'`,
      `'Nursery', 'Nursery 1', 'NUR1', 'NIGERIA'`,
      `'Nursery', 'Nursery 2', 'NUR2', 'NIGERIA'`,
    ],
  },
];

const columnDetails = {
  name: 'code',
  type: 'varchar',
  length: '255',
};

export class seedClassesForNigeria1705614965098 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      seedData.map((seed) => seed.rows.map((value) => queryRunner.query(`INSERT INTO ${seed.name} (${seed.column}) VALUES (${value})`))),
    );
    await queryRunner.query(`UPDATE ${seedData[0].name} SET code = CONCAT('${seedData[0].codePrefix}', SUBSTRING(REPLACE(UUID(), '-', ''), 1, 17))`);
    await queryRunner.changeColumns(seedData[0].name, [
      {
        oldColumn: new TableColumn({ ...columnDetails, isNullable: true }),
        newColumn: new TableColumn({ ...columnDetails, isNullable: false }),
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      seedData.map((seed) => seed.rows.map((value) => queryRunner.query(`DELETE FROM ${seed.name} WHERE ${seed.column}='${value}';`))),
    );
  }
}
