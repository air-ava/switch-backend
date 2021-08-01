"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderTable1627735546416 = void 0;
const typeorm_1 = require("typeorm");
class createOrderTable1627735546416 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'orders',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'image_url',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'picked_up',
                    type: 'boolean',
                    default: false,
                    isNullable: false,
                },
                {
                    name: 'delivered',
                    type: 'boolean',
                    default: false,
                    isNullable: false,
                },
                {
                    name: 'reference',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'payment_reference',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'status',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'item_name',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'item_amount',
                    type: 'decimal',
                    default: 0,
                    unsigned: true,
                    precision: 20,
                    scale: 4,
                    isNullable: false,
                },
                {
                    name: 'pickup_name',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'pickup_email',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'delivery_name',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'delivery_email',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'weight',
                    type: 'decimal',
                    default: 0,
                    unsigned: true,
                    precision: 20,
                    scale: 2,
                    isNullable: false,
                },
                {
                    name: 'cancelled',
                    type: 'boolean',
                    default: false,
                    isNullable: false,
                },
                {
                    name: 'cancelled_at',
                    type: 'timestamp with time zone',
                    isNullable: true,
                },
                {
                    name: 'processed_at',
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
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('orders');
    }
}
exports.createOrderTable1627735546416 = createOrderTable1627735546416;
//# sourceMappingURL=1627735546416-create-order-table.js.map