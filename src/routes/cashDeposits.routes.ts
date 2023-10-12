import express from 'express';
import { cashDepositCONTROLLER, getCashDepositCONTROLLER, listCashDepositCONTROLLER, reviewCashDepositsCONTROLLER, submitRecieptCONTROLLER, updateCashDepositRecordCONTROLLER } from '../controllers/cashDeposit.controller';
import { catchErrors } from '../utils/errors';

const router = express.Router();

router.post('/', catchErrors(cashDepositCONTROLLER));
router.get('/', catchErrors(listCashDepositCONTROLLER));
router.get('/:code', catchErrors(getCashDepositCONTROLLER));
router.post('/submit', catchErrors(submitRecieptCONTROLLER));
router.post('/review/:reference', catchErrors(reviewCashDepositsCONTROLLER));
router.patch('/:code', catchErrors(updateCashDepositRecordCONTROLLER));

export default router;
