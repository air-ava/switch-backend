"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToTrackingTable1627807543590 = void 0;
const typeorm_1 = require("typeorm");
class updateToTrackingTable1627807543590 {
    async up(queryRunner) {
        await queryRunner.changeColumns('tracking', [
            {
                oldColumn: new typeorm_1.TableColumn({
                    name: 'addressId',
                    type: 'int',
                    isNullable: false,
                }),
                newColumn: new typeorm_1.TableColumn({
                    name: 'addressId',
                    type: 'int',
                    isNullable: true,
                }),
            },
            {
                oldColumn: new typeorm_1.TableColumn({
                    name: 'orderId',
                    type: 'int',
                    isNullable: false,
                }),
                newColumn: new typeorm_1.TableColumn({
                    name: 'orderId',
                    type: 'int',
                    isNullable: true,
                }),
            },
        ]);
    }
    async down() {
        return Promise.resolve();
    }
}
exports.updateToTrackingTable1627807543590 = updateToTrackingTable1627807543590;
//# sourceMappingURL=1627807543590-update-to-tracking-table.js.map