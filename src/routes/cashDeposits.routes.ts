import express from 'express';
import { cashDepositCONTROLLER, submitReciepCONTROLLER } from '../controllers/cashDeposit.controller';
import { catchErrors } from '../utils/errors';

const router = express.Router();

router.post('/', catchErrors(cashDepositCONTROLLER));
router.post('/submit', catchErrors(submitReciepCONTROLLER));

export default router;
