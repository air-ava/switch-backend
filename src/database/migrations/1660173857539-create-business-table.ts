// import { MigrationInterface, QueryRunner, Table } from 'typeorm';

// export class createBusinessTable1660173857539 implements MigrationInterface {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.createTable(
//       new Table({
//         name: 'business',
//         columns: [
//           {
//             name: 'id',
//             type: 'int',
//             isPrimary: true,
//             isGenerated: true,
//             generationStrategy: 'increment',
//           },
//           {
//             name: 'name',
//             type: 'varchar',
//             isUnique: true,
//             isNullable: false,
//           },
//           {
//             name: 'logo',
//             type: 'varchar',
//             isNullable: true,
//           },
//           {
//             name: 'reference',
//             type: 'varchar',
//             isNullable: false,
//             isUnique: true,
//           },
//           {
//             name: 'active',
//             type: 'boolean',
//             default: true,
//             isNullable: false,
//           },
//           {
//             name: 'description',
//             type: 'varchar',
//             isNullable: true,
//           },
//           {
//             name: 'phone_number',
//             type: 'int',
//             isNullable: false,
//           },
//           {
//             name: 'owner',
//             type: 'int',
//             isNullable: false,
//           },
//           {
//             name: 'created_at',
//             type: 'timestamp',
//             default: 'NOW()',
//             isNullable: false,
//           },
//           {
//             name: 'updated_at',
//             type: 'timestamp',
//             isNullable: true,
//           },
//         ],
//       }),
//       true,
//     );
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.dropTable('business');
//   }
// }
