"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addForeignKeyToOrderTable1627754566576 = void 0;
const typeorm_1 = require("typeorm");
class addForeignKeyToOrderTable1627754566576 {
    async up(queryRunner) {
        const addPickupId = new typeorm_1.TableColumn({
            name: 'pickupId',
            type: 'int',
            isNullable: false,
        });
        const addDeliveryId = new typeorm_1.TableColumn({
            name: 'deliveryId',
            type: 'int',
            isNullable: false,
        });
        const addTrackingId = new typeorm_1.TableColumn({
            name: 'trackingId',
            type: 'int',
            isNullable: true,
        });
        const pickupId = new typeorm_1.TableForeignKey({
            columnNames: ['pickupId'],
            referencedTableName: 'addresses',
            referencedColumnNames: ['id'],
        });
        const deliveryId = new typeorm_1.TableForeignKey({
            columnNames: ['deliveryId'],
            referencedTableName: 'addresses',
            referencedColumnNames: ['id'],
        });
        const trackingId = new typeorm_1.TableForeignKey({
            columnNames: ['trackingId'],
            referencedTableName: 'tracking',
            referencedColumnNames: ['id'],
        });
        const pickup_name = new typeorm_1.TableColumn({
            name: 'pickup_name',
            type: 'text',
        });
        const pickup_email = new typeorm_1.TableColumn({
            name: 'pickup_email',
            type: 'text',
        });
        const delivery_name = new typeorm_1.TableColumn({
            name: 'delivery_name',
            type: 'text',
        });
        const delivery_email = new typeorm_1.TableColumn({
            name: 'delivery_email',
            type: 'text',
        });
        await queryRunner.addColumns('orders', [addPickupId, addDeliveryId, addTrackingId]);
        await queryRunner.dropColumns('orders', [pickup_name, pickup_email, delivery_name, delivery_email]);
        await queryRunner.createForeignKeys('orders', [pickupId, deliveryId, trackingId]);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('orders');
    }
}
exports.addForeignKeyToOrderTable1627754566576 = addForeignKeyToOrderTable1627754566576;
//# sourceMappingURL=1627754566576-add-foreign-key-to-order-table.js.map