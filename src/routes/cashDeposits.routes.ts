import express from 'express';
import { cashDepositCONTROLLER } from '../controllers/cashDeposit.controller';
import { catchErrors } from '../utils/errors';

const router = express.Router();

router.post('/', catchErrors(cashDepositCONTROLLER));

export default router;
