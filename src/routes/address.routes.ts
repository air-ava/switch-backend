import express from 'express';
import { createAddressCONTROLLER, getAddressCONTROLLER } from '../controllers/address.controller';

const router = express.Router();

/**
 * @swagger
 *
 * /api/address/:
 *   get:
 *     security:
 *      - Bearer: []
 *     tags:
 *       - Address
 *     summary: View your Addresses
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.get('/', getAddressCONTROLLER);

/**
 * @swagger
 *
 * /api/address/:
 *   post:
 *     security:
 *      - Bearer: []
 *     tags:
 *       - Address
 *     summary: Create a new Address
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *          $ref: '#/definitions/CreateAddress'
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.post('/', createAddressCONTROLLER);

export default router;

/**
 * @swagger
 * definitions:
 *  CreateAddress:
 *   type: object
 *   properties:
 *     street:
 *       type: string
 *       example: Greatest Business
 *     country:
 *       type: string
 *       example: Nigeria
 *     state:
 *       type: string
 *       example: Kaduna
 *     city:
 *       type: string
 *       example: Maryland
 *     is_business:
 *       type: boolean
 *       example: 'true'
 *     default:
 *       type: boolean
 *       example: 'true'
 *     reference:
 *       type: string
 *       example: bs_cwdd2
 *       summary: Business Reference
 *       required: true
 *
 */
