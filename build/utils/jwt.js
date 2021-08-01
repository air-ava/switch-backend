"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function signToken(payload, key) {
    return jsonwebtoken_1.default.sign(payload, key);
}
exports.signToken = signToken;
function decodeToken(token, key) {
    try {
        jsonwebtoken_1.default.verify(token, key);
        return { success: true };
    }
    catch (error) {
        return { success: false };
    }
}
exports.decodeToken = decodeToken;
//# sourceMappingURL=jwt.js.map