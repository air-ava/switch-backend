"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserTable1627744778669 = void 0;
const typeorm_1 = require("typeorm");
class createUserTable1627744778669 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'email',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: 'first_name',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'last_name',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'password',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'phone_number',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: 'is_business',
                    type: 'boolean',
                    default: false,
                    isNullable: false,
                },
                {
                    name: 'created_at',
                    type: 'timestamp with time zone',
                    default: 'NOW()',
                    isNullable: false,
                },
                {
                    name: 'updated_at',
                    type: 'timestamp with time zone',
                    default: 'NOW()',
                    isNullable: false,
                },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('users');
    }
}
exports.createUserTable1627744778669 = createUserTable1627744778669;
//# sourceMappingURL=1627744778669-create-user-table.js.map