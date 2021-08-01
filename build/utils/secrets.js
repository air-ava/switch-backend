"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_KEY = exports.USER_GATEWAY_PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
dotenv_1.default.config();
function throwIfUndefined(secret) {
    if (!process.env[secret]) {
        logger_1.default.error(`Please set ${secret} environment variable`);
        process.exit(1);
    }
    return process.env[secret];
}
exports.USER_GATEWAY_PORT = throwIfUndefined('USER_GATEWAY_PORT');
exports.JWT_KEY = throwIfUndefined('JWT_KEY');
//# sourceMappingURL=secrets.js.map