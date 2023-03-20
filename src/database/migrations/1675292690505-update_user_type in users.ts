// import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// export class updateUserTypeInUsers1675292690505 implements MigrationInterface {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.changeColumns('users', [
//       {
//         oldColumn: new TableColumn({
//           name: 'user_type',
//           type: 'enum',
//           enum: ['sponsor', 'partner', 'scholar', 'steward'],
//           isNullable: false,
//         }),
//         newColumn: new TableColumn({
//           name: 'user_type',
//           type: 'enum',
//           enum: ['sponsor', 'partner', 'scholar', 'steward', 'school', 'vendor'],
//           isNullable: true,
//         }),
//       },
//     ]);
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     return Promise.resolve();
//   }
// }
