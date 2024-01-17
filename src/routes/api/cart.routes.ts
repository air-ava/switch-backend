import express from 'express';
import { createAddressCONTROLLER, getAddressCONTROLLER } from '../../controllers/address.controller';
import { createCartCONTROLLER, deleteItemCONTROLLER, getCartCONTROLLER } from '../../controllers/cart.contoller';
import { completeCheckoutCONTROLLER } from '../../controllers/checkout.controller';

const router = express.Router();

/**
 * @swagger
 *
 * /api/cart/{business}:
 *   get:
 *     security:
 *      - Bearer: []
 *     tags:
 *       - Carting and Checkout
 *     summary: View your CreateCart
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         required: true
 *         type: string
 *         name: business
 *         description: for identifing a businesses store
 *         example: "cr_0uvro"
 *       - in: query
 *         required: false
 *         type: string
 *         name: is_business
 *         description: for a store to view carted items (*REQUIRED FOR BUSINESS)
 *         example: true
 *       - in: query
 *         required: false
 *         type: string
 *         name: reference
 *         description: for viewing one cart and its items in the businesses store
 *         example: "cr_0uvro"
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.get('/:business', getCartCONTROLLER);

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
router.post('/checkout', completeCheckoutCONTROLLER);

/**
 * @swagger
 *
 * /api/cart/{item}:
 *   get:
 *     security:
 *      - Bearer: []
 *     tags:
 *       - Carting and Checkout
 *     summary: Delete an Item from a Cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         required: true
 *         type: string
 *         name: business
 *         description: for identifing an Item in a Cart
 *         example: 1
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.delete('/:item', deleteItemCONTROLLER);

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
