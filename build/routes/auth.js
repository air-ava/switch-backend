"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSession = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secrets_1 = require("../utils/secrets");
const decodeToken = (token) => {
    try {
        const decrypted = jsonwebtoken_1.default.verify(token, secrets_1.JWT_KEY);
        return { success: true, message: 'Session authenticated', data: { id: decrypted.sub } };
    }
    catch (error) {
        return { success: false, error: 'Invalid or expired token provided.' };
    }
};
const validateSession = (req, res, next) => {
    const Authorization = req.headers.authorization;
    if (!Authorization) {
        return res.status(401).json({
            success: false,
            error: 'Request unauthorized',
        });
    }
    const [, token] = Authorization.split('Bearer ');
    const decodeResponse = decodeToken(token);
    if (!decodeResponse.success) {
        return res.status(401).json(decodeResponse);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // req.userId = Number(decodeResponse.data!.id);
    return next();
};
exports.validateSession = validateSession;
//# sourceMappingURL=auth.js.map