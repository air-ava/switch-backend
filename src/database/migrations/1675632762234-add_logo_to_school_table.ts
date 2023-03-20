// import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// export class addLogoToSchoolTable1675632762234 implements MigrationInterface {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.addColumns('schools', [
//       new TableColumn({
//         name: 'logo',
//         type: 'int',
//         isNullable: true,
//       }),
//       new TableColumn({
//         name: 'website',
//         type: 'varchar',
//         isNullable: true,
//       }),
//     ]);
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     return Promise.resolve();
//   }
// }
