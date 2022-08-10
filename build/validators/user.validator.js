"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
/* eslint-disable max-classes-per-file */
const joi_1 = __importDefault(require("joi"));
exports.userSchema = joi_1.default.object().keys({
    phone_number: joi_1.default.string().regex(/^234[789][01]\d{8}$/),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    is_business: joi_1.default.boolean().allow(null),
    first_name: joi_1.default.string().min(3).message('First Name must have more than 3 Characters').required(),
    last_name: joi_1.default.string().min(3).message('Last Name must have more than 3 Characters').required(),
});
//# sourceMappingURL=user.validator.js.map