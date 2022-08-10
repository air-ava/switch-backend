"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_PASSWORD = exports.DB_PORT = exports.DB_USERNAME = exports.DB_HOST = exports.DB_NAME = exports.JWT_KEY = exports.PORT = void 0;
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
exports.PORT = throwIfUndefined('PORT');
// export const USER_GATEWAY_PORT = throwIfUndefined('USER_GATEWAY_PORT');
exports.JWT_KEY = throwIfUndefined('JWT_KEY');
exports.DB_NAME = throwIfUndefined('DB_NAME');
exports.DB_HOST = throwIfUndefined('DB_HOST');
exports.DB_USERNAME = throwIfUndefined('DB_USERNAME');
exports.DB_PORT = throwIfUndefined('DB_PORT');
exports.DB_PASSWORD = throwIfUndefined('DB_PASSWORD');
//# sourceMappingURL=secrets.js.map