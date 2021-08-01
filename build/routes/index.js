"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_1 = require("./order");
const user_1 = require("./user");
// import { validateSession } from './auth';
const router = express_1.default.Router();
router.get('/', (_, res) => res.json({ success: true, message: 'User gateway v1 up.' }));
// router.use(validateSession);
router.post('/user', user_1.userResource);
router.post('/address', user_1.AddressCreator);
router.post('/makeOrder', order_1.makeOrder);
router.post('/pickUp', order_1.pickUp);
router.post('/deliver', order_1.deliver);
router.post('/tracker-update', order_1.Trackerupdate);
router.get('/order', order_1.getOrderRequest);
router.get('/get-tracker', order_1.getTrackerRequest);
router.get('/get-address', order_1.getAddressRequest);
router.get('/get-orders', order_1.getOrdersRequest);
exports.default = router;
//# sourceMappingURL=index.js.map