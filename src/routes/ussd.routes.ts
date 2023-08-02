import { catchErrors } from './../utils/errors';
import express from 'express';
import { requestPaymentCONTROLLER } from '../controllers/momo.controller';
import { africasTalkingCONTROLLER } from '../controllers/ussd.controller';
// import { listTransactionsCONTROLLER, getTransactionCONTROLLER } from '../controllers/transaction.controller';
import { getWalletCONTROLLER, setWalletPinCONTROLLER, updateWalletPinCONTROLLER } from '../controllers/wallets.controller';

const router = express.Router();

router.post('/africastalking', africasTalkingCONTROLLER);
router.post('/momo', catchErrors(requestPaymentCONTROLLER));

// router.get('/:id', getTransactionCONTROLLER);
export default router;
