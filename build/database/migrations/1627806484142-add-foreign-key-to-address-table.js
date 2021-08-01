"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addForeignKeyToAddressTable1627806484142 = void 0;
const typeorm_1 = require("typeorm");
class addForeignKeyToAddressTable1627806484142 {
    async up(queryRunner) {
        const addTrackingId = new typeorm_1.TableColumn({
            name: 'trackingId',
            type: 'int',
            isNullable: true,
        });
        const trackingId = new typeorm_1.TableForeignKey({
            columnNames: ['trackingId'],
            referencedTableName: 'tracking',
            referencedColumnNames: ['id'],
        });
        await queryRunner.addColumns('addresses', [addTrackingId]);
        await queryRunner.createForeignKeys('addresses', [trackingId]);
    }
    async down() {
        return Promise.resolve();
    }
}
exports.addForeignKeyToAddressTable1627806484142 = addForeignKeyToAddressTable1627806484142;
//# sourceMappingURL=1627806484142-add-foreign-key-to-address-table.js.map