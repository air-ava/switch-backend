import express from 'express';
import { createPaymentCONTROLLER, getPaymentCONTROLLER, listPaymentsCONTROLLER } from '../controllers/payment.controller';
import { fundWalletPinCONTROLLER } from '../controllers/wallets.controller';

const router = express.Router();

router.post('/', createPaymentCONTROLLER);
router.post('/top-up', fundWalletPinCONTROLLER);
router.get('/', listPaymentsCONTROLLER);
router.get('/:code', getPaymentCONTROLLER);

export default router;
