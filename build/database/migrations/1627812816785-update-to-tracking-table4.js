"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToTrackingTable41627812816785 = void 0;
const typeorm_1 = require("typeorm");
class updateToTrackingTable41627812816785 {
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
exports.updateToTrackingTable41627812816785 = updateToTrackingTable41627812816785;
//# sourceMappingURL=1627812816785-update-to-tracking-table4.js.map