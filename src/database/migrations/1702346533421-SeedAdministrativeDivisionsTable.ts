import { MigrationInterface, QueryRunner } from 'typeorm';
import nigerianStates from '../../mocks/nigerianStates.json';
import ugandaRegions from '../../mocks/ugandaRegion.json';

const seedData: {
  name: string;
  column: string;
  codePrefix: string;
  rows: string[];
}[] = [
  {
    name: 'country_states',
    column: '`country`, `state_district`, `postal_code`, `alpha_code`, `lga_cities`',
    codePrefix: 'add_',
    rows: [],
  },
];

const nijaJsonData = nigerianStates;
const ugJsonData = ugandaRegions;
// eslint-disable-next-line no-restricted-syntax
for (const state of nijaJsonData.states) {
  const { name, postalCode, lgas, code } = state;
  const country = 'NIGERIA';
  (seedData[0].rows as string[]).push(`'${country}', '${name}', '${postalCode}', '${code}', '${lgas}'`);
}

// eslint-disable-next-line no-restricted-syntax
for (const region of ugJsonData.regions) {
  const { name, code, districts, alpha_code } = region;
  const country = 'UGANDA';
  (seedData[0].rows as string[]).push(`'${country}', '${name}', '${code}', '${alpha_code}', '${districts}'`);
}

export class SeedAdministrativeDivisionsTable1702346533421 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      seedData.map((seed) => seed.rows.map((value) => queryRunner.query(`INSERT INTO ${seed.name} (${seed.column}) VALUES (${value})`))),
    );
    await queryRunner.query(`UPDATE ${seedData[0].name} SET code = CONCAT('${seedData[0].codePrefix}', SUBSTRING(REPLACE(UUID(), '-', ''), 1, 17))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      seedData.map((seed) => seed.rows.map((value) => queryRunner.query(`DELETE FROM ${seed.name} WHERE ${seed.column}='${value}';`))),
    );
  }
}
