import express from 'express';
import { createAddressCONTROLLER, getAddressCONTROLLER } from '../controllers/address.controller';
import { createCartCONTROLLER } from '../controllers/cart.contoller';

const router = express.Router();

/**
 * @swagger
 *
 * /api/cart/:
 *   get:
 *     security:
 *      - Bearer: []
 *     tags:
 *       - Carting and Checkout
 *     summary: View your CreateCart
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
 * /api/cart/:
 *   post:
 *     security:
 *      - Bearer: []
 *     tags:
 *       - Carting and Checkout
 *     summary: Create a new CreateCart
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *          $ref: '#/definitions/CreateCart'
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.post('/', createCartCONTROLLER);

export default router;

/**
 * @swagger
 * definitions:
 *  SelectProduct:
 *   type: object
 *   properties:
 *     quantity:
 *       type: number
 *       example: 2
 *     items:
 *       type: string
 *       example: pr_c340h
 *  CreateCart:
 *    type: object
 *    properties:
 *      products:
 *        $ref: '#/definitions/SelectProduct'
 *      business:
 *        type: string
 *        example: bs_f32am
 */
