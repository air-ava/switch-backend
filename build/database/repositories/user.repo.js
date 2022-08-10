"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUser = void 0;
const typeorm_1 = require("typeorm");
const users_model_1 = require("../models/users.model");
const findUser = async (queryParam, selectOptions, t) => {
    return t
        ? t.manager.findOne(users_model_1.Users, Object.assign({ where: queryParam }, (selectOptions.length && { select: selectOptions.concat(['id']) })))
        : (0, typeorm_1.getRepository)(users_model_1.Users).findOne(Object.assign({ where: queryParam }, (selectOptions.length && { select: selectOptions.concat(['id']) })));
};
exports.findUser = findUser;
//# sourceMappingURL=user.repo.js.map