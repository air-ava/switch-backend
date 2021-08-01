"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserIdToOrdersTable1627795140055 = void 0;
const typeorm_1 = require("typeorm");
class addUserIdToOrdersTable1627795140055 {
    async up(queryRunner) {
        const addUserId = new typeorm_1.TableColumn({
            name: 'userId',
            type: 'int',
            isNullable: true,
        });
        const userId = new typeorm_1.TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
        });
        await queryRunner.addColumns('orders', [addUserId]);
        await queryRunner.createForeignKeys('orders', [userId]);
    }
    async down() {
        return Promise.resolve();
    }
}
exports.addUserIdToOrdersTable1627795140055 = addUserIdToOrdersTable1627795140055;
//# sourceMappingURL=1627795140055-add-userId-to-orders-table.js.map