"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressTable1627791017613 = void 0;
const typeorm_1 = require("typeorm");
class updateAddressTable1627791017613 {
    async up(queryRunner) {
        await queryRunner.changeColumn('addresses', 'userId', new typeorm_1.TableColumn({
            name: 'userId',
            type: 'int',
            isNullable: true,
        }));
    }
    async down() {
        return Promise.resolve();
    }
}
exports.updateAddressTable1627791017613 = updateAddressTable1627791017613;
//# sourceMappingURL=1627791017613-update-address-table.js.map