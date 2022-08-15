import express from 'express';
import { getAddressCONTROLLER } from '../controllers/address.controller';

const router = express.Router();

/**
 * @swagger
 *
 * /api/business/:
 *   get:
 *     security:
 *      - Bearer: []
 *     tags:
 *       - Business
 *     summary: Create a new business
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.get('/', getAddressCONTROLLER);

export default router;
