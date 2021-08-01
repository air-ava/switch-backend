"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueryRunner = void 0;
const typeorm_1 = require("typeorm");
const getQueryRunner = async () => {
    const connection = typeorm_1.getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    return queryRunner;
};
exports.getQueryRunner = getQueryRunner;
//# sourceMappingURL=db.js.map