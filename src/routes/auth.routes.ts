import express from 'express';
import { loginCONTROLLER, signUpCONTROLLER } from '../controllers/user.controller';

const router = express.Router();

/**
 * @swagger
 *
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Create a User Account
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         required: true
 *         type: string
 *         name: register user
 *         schema:
 *          properties:
 *              first_name:
 *                  type: string
 *                  example: "Daniel"
 *              last_name:
 *                  type: string
 *                  example: "John"
 *              email:
 *                  type: string
 *                  example: "danya.degoke@gmail.com"
 *              phone_number:
 *                  type: string
 *                  example: "2348135613401"
 *              password:
 *                  type: string
 *                  example: "myAwesomeP@ssw0rd"
 *              is_business:
 *                  type: boolean
 *                  example: true
 *                  required: false
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
 *         type: string
 *         name: register user
 *         schema:
 *          properties:
 *              email:
 *                  type: string
 *                  example: "danya.degoke@gmail.com"
 *              password:
 *                  type: string
 *                  example: "myAwesomeP@ssw0rd"
 *     responses:
 *       '200':
 *         description: Ok
 *       '500':
 *         description: Internal error
 */
router.post('/login', loginCONTROLLER);

export default router;
