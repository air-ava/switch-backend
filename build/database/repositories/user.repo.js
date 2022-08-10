"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAUser = exports.findUser = void 0;
const typeorm_1 = require("typeorm");
const users_model_1 = require("../models/users.model");
const findUser = async (queryParam, selectOptions, t) => {
    return t
        ? t.manager.findOne(users_model_1.Users, Object.assign({ where: queryParam }, (selectOptions.length && { select: selectOptions.concat(['id']) })))
        : (0, typeorm_1.getRepository)(users_model_1.Users).findOne(Object.assign({ where: queryParam }, (selectOptions.length && { select: selectOptions.concat(['id']) })));
};
exports.findUser = findUser;
const createAUser = async (payload) => {
    const { t } = payload, rest = __rest(payload, ["t"]);
    return t ? t.manager.insert(users_model_1.Users, rest) : (0, typeorm_1.getRepository)(users_model_1.Users).insert(rest);
};
exports.createAUser = createAUser;
//# sourceMappingURL=user.repo.js.map