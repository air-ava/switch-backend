"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrackingTable1627744770860 = void 0;
const typeorm_1 = require("typeorm");
class createTrackingTable1627744770860 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'tracking',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'reference',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'orderId',
                    type: 'int',
                    isNullable: false,
                },
                {
                    name: 'addressId',
                    type: 'int',
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
        }));
        const addressId = new typeorm_1.TableForeignKey({
            columnNames: ['addressId'],
            referencedTableName: 'addresses',
            referencedColumnNames: ['id'],
        });
        const orderId = new typeorm_1.TableForeignKey({
            columnNames: ['orderId'],
            referencedTableName: 'orders',
            referencedColumnNames: ['id'],
        });
        await queryRunner.createForeignKeys('tracking', [addressId, orderId]);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('tracking');
    }
}
exports.createTrackingTable1627744770860 = createTrackingTable1627744770860;
//# sourceMappingURL=1627744770860-create-tracking-table.js.map