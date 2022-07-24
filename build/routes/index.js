"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// eslint-disable-next-line prettier/prettier
const user_1 = require("./user");
const auth_1 = require("./auth");
const router = express_1.default.Router();
router.get('/', (_, res) => res.json({ success: true, message: 'User gateway v1 up.' }));
router.post('/user', user_1.userResource);
router.use(auth_1.validateSession);
router.post('/address', user_1.AddressCreator);
exports.default = router;
//# sourceMappingURL=index.js.map