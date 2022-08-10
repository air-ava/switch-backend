"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// eslint-disable-next-line prettier/prettier
const auth_routes_1 = __importDefault(require("./auth.routes"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', (_, res) => res.json({ success: true, message: 'User gateway v1 up.' }));
router.use('/auth', auth_routes_1.default);
router.use(auth_middleware_1.validateSession);
exports.default = router;
//# sourceMappingURL=index.js.map