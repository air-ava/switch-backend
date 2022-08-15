import express from 'express';
import { getAddressCONTROLLER } from '../controllers/address.controller';
import { allBusinessCONTROLLER } from '../controllers/business.controller';
import { viewAllProductCONTROLLER } from '../controllers/product.controller';
import { allBusinessAndProductsCONTROLLER } from '../controllers/public.controller';

const router = express.Router();

/**
 * @swagger
 *
 * /api/public:
 *   get:
 *     tags:
 *       - Store
 *     summary: Get all products of a business as a shopper
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         required: false
 *         type: string
 *         name: from
 *       - in: query
 *         required: false
 *         type: string
 *         name: to
 *       - in: query
 *         required: false
 *         type: string
 *         name: search
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.get('/', allBusinessAndProductsCONTROLLER);

/**
 * @swagger
 *
 * /api/public/products:
 *   get:
 *     tags:
 *       - Store
 *     summary: Get all products of a business as a shopper
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         required: false
 *         type: string
 *         name: from
 *       - in: query
 *         required: false
 *         type: string
 *         name: to
 *       - in: query
 *         required: false
 *         type: string
 *         name: search
 *       - in: query
 *         required: true
 *         type: string
 *         name: business
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.get('/products', viewAllProductCONTROLLER);

/**
 * @swagger
 *
 * /api/public/address:
 *   get:
 *     tags:
 *       - Store
 *     summary: Get all products of a business as a shopper
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         required: true
 *         type: string
 *         name: business
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.get('/address', getAddressCONTROLLER);

/**
 * @swagger
 *
 * /api/public/business:
 *   get:
 *     tags:
 *       - Store
 *     summary: Get all products of a business as a shopper
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.get('/business', allBusinessCONTROLLER);

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
