import express from 'express';
import { createPaymentCONTROLLER, getPaymentCONTROLLER, listPaymentsCONTROLLER } from '../controllers/payment.controller';
import { fundWalletCONTROLLER, withdrawFromWalletCONTROLLER } from '../controllers/wallets.controller';

const router = express.Router();

router.post('/', createPaymentCONTROLLER);
router.post('/top-up', fundWalletCONTROLLER);
router.post('/withdraw', withdrawFromWalletCONTROLLER);
router.get('/', listPaymentsCONTROLLER);
router.get('/:code', getPaymentCONTROLLER);

export default router;
