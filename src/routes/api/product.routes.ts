import express from 'express';
import { createProductCONTROLLER } from '../../controllers/product.controller';

const router = express.Router();

/**
 * @swagger
 *
 * /api/product/create:
 *   post:
 *     security:
 *      - Bearer: []
 *     tags:
 *       - Products
 *     summary: Create a new product
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *          $ref: '#/definitions/CreateProduct'
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.post('/create', createProductCONTROLLER);

export default router;

/**
 * @swagger
 * definitions:
 *  CreateProduct:
 *     type: object
 *     properties:
 *       description:
 *          type: string
 *          example: "Greatest Business"
 *       name:
 *          type: string
 *          example: "Daniel and Sons"
 *       images:
 *          type: array
 *          items:
 *            type: string
 *            example: "https://www.jumia.com.ng/favicon.ico"
 *          required: true
 *       business:
 *          type: string
 *          example: "bs_kfji0"
 *       product_categories:
 *          type: number
 *          example: 1
 *       unit_price:
 *          type: number
 *          example: 100
 */
