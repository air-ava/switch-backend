"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToTrackingTable51627813210656 = void 0;
const typeorm_1 = require("typeorm");
class updateToTrackingTable51627813210656 {
    async up(queryRunner) {
        const tracking_ref = new typeorm_1.TableColumn({
            name: 'tracking_ref',
            type: 'text',
        });
        const addTrackRef = new typeorm_1.TableColumn({
            name: 'tracking_ref',
            type: 'text',
            isNullable: true,
        });
        await queryRunner.dropColumns('tracking', [tracking_ref]);
        await queryRunner.addColumns('orders', [addTrackRef]);
    }
    async down() {
        return Promise.resolve();
    }
}
exports.updateToTrackingTable51627813210656 = updateToTrackingTable51627813210656;
//# sourceMappingURL=1627813210656-update-to-tracking-table5.js.map