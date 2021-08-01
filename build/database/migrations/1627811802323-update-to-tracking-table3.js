"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToTrackingTable31627811802323 = void 0;
const typeorm_1 = require("typeorm");
class updateToTrackingTable31627811802323 {
    async up(queryRunner) {
        const addId = new typeorm_1.TableColumn({
            name: 'location_address_id',
            type: 'int',
            isNullable: true,
        });
        await queryRunner.addColumns('orders', [addId]);
    }
    async down() {
        return Promise.resolve();
    }
}
exports.updateToTrackingTable31627811802323 = updateToTrackingTable31627811802323;
//# sourceMappingURL=1627811802323-update-to-tracking-table3.js.map