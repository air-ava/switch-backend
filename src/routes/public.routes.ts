import express from 'express';
import { getAddressCONTROLLER } from '../controllers/address.controller';
import { viewAllBusinessCONTROLLER } from '../controllers/business.controller';
import { countriesCONTROLLER } from '../controllers/miscillaneous.controller';
import { viewAllProductCategoriesCONTROLLER, viewAllProductCONTROLLER } from '../controllers/product.controller';
import { allBusinessAndProductsCONTROLLER, getPartnershipScholarshipCONTROLLER, getScholarshipsCONTROLLER } from '../controllers/public.controller';
import { addSponsorsCONTROLLER, getScholarshipCONTROLLER, scholarshipApplicationCONTROLLER } from '../controllers/scholarship.controller';

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
 *         type: string`
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
router.get('/countries', countriesCONTROLLER);
router.get('/partner/:slug', getPartnershipScholarshipCONTROLLER);
router.get('/scholarship', getScholarshipsCONTROLLER);
router.get('/scholarship/:code', getScholarshipCONTROLLER);
router.post('/scholarship/:code/apply', scholarshipApplicationCONTROLLER);
router.post('/scholarship/:code/sponsor', addSponsorsCONTROLLER);

/**
 * @swagger
 *
 * /api/public/products/{business}:
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
 *       - in: path
 *         required: true
 *         type: string
 *         name: business
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.get('/products/:business', viewAllProductCONTROLLER);

/**
 * @swagger
 *
 * /api/public/products/category:
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
router.get('/category', viewAllProductCategoriesCONTROLLER);

/**
 * @swagger
 *
 * /api/public/address/{business}:
 *   get:
 *     tags:
 *       - Store
 *     summary: Get all products of a business as a shopper
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         required: true
 *         type: string
 *         name: business
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.get('/address/:business', getAddressCONTROLLER);

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
router.get('/business', viewAllBusinessCONTROLLER);

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
