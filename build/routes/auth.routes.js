"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
/**
 * @swagger
 *
 * /api/register:
 *   post:
 *     tags:
 *       - Machines
 *     summary: Create a User Account
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: raw
 *         required: true
 *         type: string
 *         name: machineId
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.post('/register', user_controller_1.signUp);
router.post('/login', user_controller_1.signUp);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map