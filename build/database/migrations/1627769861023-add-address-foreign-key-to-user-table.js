"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAddressForeignKeyToUserTable1627769861023 = void 0;
const typeorm_1 = require("typeorm");
class addAddressForeignKeyToUserTable1627769861023 {
    async up(queryRunner) {
        const addAddressId = new typeorm_1.TableColumn({
            name: 'addressId',
            type: 'int',
            isNullable: true,
        });
        const addOrderId = new typeorm_1.TableColumn({
            name: 'orderId',
            type: 'int',
            isNullable: true,
        });
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
        await queryRunner.addColumns('users', [addAddressId, addOrderId]);
        await queryRunner.createForeignKeys('users', [addressId, orderId]);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('users');
    }
}
exports.addAddressForeignKeyToUserTable1627769861023 = addAddressForeignKeyToUserTable1627769861023;
//# sourceMappingURL=1627769861023-add-address-foreign-key-to-user-table.js.map