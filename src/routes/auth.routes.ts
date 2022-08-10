import express from 'express';
import { signUp } from '../controllers/user.controller';

const router = express.Router();

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
router.post('/register', signUp);
router.post('/login', signUp);

export default router;
