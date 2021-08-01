"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAddressTable1627744607808 = void 0;
const typeorm_1 = require("typeorm");
class createAddressTable1627744607808 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'addresses',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'userId',
                    type: 'int',
                    isNullable: false,
                },
                {
                    name: 'address',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'country',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'state',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'city',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'default',
                    type: 'boolean',
                    default: false,
                    isNullable: false,
                },
                {
                    name: 'business_mobile',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'type',
                    type: 'varchar',
                    default: "'is_user'",
                    isNullable: false,
                },
                {
                    name: 'deleted',
                    type: 'boolean',
                    default: false,
                    isNullable: false,
                },
                {
                    name: 'deleted_at',
                    type: 'timestamp with time zone',
                    isNullable: true,
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
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('addresses');
    }
}
exports.createAddressTable1627744607808 = createAddressTable1627744607808;
//# sourceMappingURL=1627744607808-create-address-table.js.map