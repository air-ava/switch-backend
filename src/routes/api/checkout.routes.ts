import express from 'express';
import { completeCheckoutCONTROLLER } from '../../controllers/checkout.controller';

const router = express.Router();
/**
 * @swagger
 *
 * /api/cart/checkout:
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
 *          $ref: '#/definitions/CompleteCheckout'
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.post('/', completeCheckoutCONTROLLER);

export default router;

/**
 * @swagger
 * definitions:
 *  CompleteCheckout:
 *   type: object
 *   properties:
 *     cartReference:
 *       type: string
 *       example: cr_bc9h6
 *     business:
 *       type: string
 *       example: bs_f32am
 *     shopper_address:
 *       type: number
 *       example: '3'
 *     business_address:
 *       type: number
 *       example: '11'
 */
