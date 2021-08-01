"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const { Console } = winston_1.default.transports;
const { json, combine, timestamp } = winston_1.default.format;
const timezoned = () => {
    return new Date().toLocaleString('en-GB', {
        timeZone: 'Africa/Lagos',
    });
};
const logger = winston_1.default.createLogger({
    format: combine(timestamp({ format: timezoned }), json()),
    transports: [new Console()],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map