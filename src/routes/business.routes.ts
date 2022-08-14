import express from 'express';
import {
  createBusinessCONTROLLER,
  getBusinessCONTROLLER,
  updateBusinessCONTROLLER,
  viewAllBusinessCONTROLLER,
} from '../controllers/business.controller';

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

/**
 * @swagger
 *
 * /api/business/{ref}:
 *   patch:
 *     security:
 *      - Bearer: []
 *     tags:
 *       - Business
 *     summary: Create a new business
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         required: true
 *         type: string
 *         name: ref
 *       - in: body
 *         schema:
 *          $ref: '#/definitions/updateBusiness'
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.patch('/update/:{ref}', updateBusinessCONTROLLER);

/**
 * @swagger
 *
 * /api/business/{ref}:
 *   get:
 *     security:
 *      - Bearer: []
 *     tags:
 *       - Business
 *     summary: Create a new business
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         required: true
 *         type: string
 *         name: ref
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.get('/:{ref}', getBusinessCONTROLLER);

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
router.get('/', viewAllBusinessCONTROLLER);

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
 *  updateBusiness:
 *     type: object
 *     properties:
 *       description:
 *          type: string
 *          required: false
 *          example: "Greatest Business"
 *       name:
 *          type: string
 *          required: false
 *          example: "Daniel and Sons"
 *       logo:
 *          type: string
 *          example: "https://www.jumia.com.ng/favicon.ico"
 *          required: false
 *       phone_number:
 *          required: false
 *          $ref: '#/definitions/PhoneNumbers'
 */
