"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.createUser = void 0;
const bcrypt = __importStar(require("bcrypt"));
const user_validator_1 = require("../validators/user.validator");
const errors_1 = require("../utils/errors");
const user_repo_1 = require("../database/repositories/user.repo");
// import { Addresses } from '../database/models/Addresses';
const createUser = async (data) => {
    const validation = user_validator_1.userSchema.validate(data);
    if (validation.error)
        return (0, errors_1.ResourceNotFoundError)(validation.error);
    const { is_business = false, email, phone_number, password } = data, rest = __rest(data, ["is_business", "email", "phone_number", "password"]);
    try {
        const userAlreadyExist = await (0, user_repo_1.findUser)({ email }, []);
        if (userAlreadyExist)
            return (0, errors_1.BadRequestException)('Account already exists');
        await (0, user_repo_1.createAUser)(Object.assign(Object.assign({ email }, rest), { phone_number: phone_number.replace('+', ''), password: bcrypt.hashSync(password, 8), is_business }));
        return (0, errors_1.sendObjectResponse)('Account created successfully');
    }
    catch (e) {
        return (0, errors_1.BadRequestException)('Account creation failed, kindly try again', e);
    }
};
exports.createUser = createUser;
//# sourceMappingURL=user.service.js.map