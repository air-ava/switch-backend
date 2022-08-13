import express from 'express';
import { createBusinessCONTROLLER } from '../controllers/business.controller';

const router = express.Router();

/**
 * @swagger
 *
 * /api/business/create:
 *   post:
 *     security:
 *      - Bearer: []
 *     tags:
 *       - Business
 *     summary: Create a new business
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         schema:
 *          $ref: '#/definitions/CreateBusiness'
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */

router.post('/create', createBusinessCONTROLLER);
router.post('/update', createBusinessCONTROLLER);

export default router;

/**
 * @swagger
 * definitions:
 *  CreateBusiness:
 *     type: object
 *     properties:
 *       description:
 *          type: string
 *          example: "Greatest Business"
 *       name:
 *          type: string
 *          example: "Daniel and Sons"
 *       logo:
 *          type: string
 *          example: "https://www.jumia.com.ng/favicon.ico"
 *          required: false
 *       phone_number:
 *          $ref: '#/definitions/PhoneNumbers'
 */
