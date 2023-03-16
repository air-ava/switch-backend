import express from 'express';
import {
  completeBankTransferCONTROLLER,
  createPaymentCONTROLLER,
  getPaymentCONTROLLER,
  initiatePaymentCONTROLLER,
  listPaymentsCONTROLLER,
  recordBankTransferCONTROLLER,
  updateBankTransferCONTROLLER,
} from '../controllers/payment.controller';
import { fundWalletCONTROLLER, withdrawFromWalletCONTROLLER } from '../controllers/wallets.controller';

const router = express.Router();

router.post('/', createPaymentCONTROLLER);
router.post('/mobile-money/request', initiatePaymentCONTROLLER);
router.post('/bank/record', recordBankTransferCONTROLLER);
router.patch('/bank/update', updateBankTransferCONTROLLER);
router.patch('/bank/complete', completeBankTransferCONTROLLER);
router.post('/top-up', fundWalletCONTROLLER);
router.post('/withdraw', withdrawFromWalletCONTROLLER);
router.get('/', listPaymentsCONTROLLER);
router.get('/:code', getPaymentCONTROLLER);

export default router;
