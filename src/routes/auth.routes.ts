import express from 'express';
import { forgotCONTROLLER, loginCONTROLLER, newPasswordCONTROLLER, resendCONTROLLER, signUpCONTROLLER, verifyCONTROLLER } from '../controllers/auth.controller';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Create a User Account
 *     produces: [application/json]
 *     parameters:
 *       - in: body
 *         required: true
 *         type: string
 *         name: register user
 *         schema:
 *          $ref: '#/definitions/RegisterUser'
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.post('/register', signUpCONTROLLER);

/**
 * @swagger
 *
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Shopper login
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         required: true
 *         name: login
 *         schema:
 *          $ref: '#/definitions/LoginUser'
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.post('/login', loginCONTROLLER);
router.post('/forgot', forgotCONTROLLER);
router.post('/change', newPasswordCONTROLLER);
router.post('/resend/:email', resendCONTROLLER);

export default router;

/**
 * @swagger
 * definitions:
 *  RegisterUser:
 *     type: object
 *     properties:
 *       first_name:
 *          type: string
 *          example: "Daniel"
 *       last_name:
 *          type: string
 *          example: "John"
 *       email:
 *          type: string
 *          example: "danya.degoke@gmail.com"
 *       phone_number:
 *          $ref: '#/definitions/PhoneNumbers'
 *       password:
 *          type: string
 *          example: "myAwesomeP@ssw0rd"
 *       is_business:
 *          type: boolean
 *          example: true
 *          required: false
 *  LoginUser:
 *     type: object
 *     properties:
 *       email:
 *           type: string
 *           example: "danya.degoke@gmail.com"
 *       password:
 *           type: string
 *           example: "Dafecommand06!"
 *       is_business:
 *           type: boolean
 *           example: false
 *           summary: for loging into business or user
 */
