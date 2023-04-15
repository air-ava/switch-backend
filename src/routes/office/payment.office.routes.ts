import express from 'express';
import {
  completeBankTransferCONTROLLER,
  createPaymentCONTROLLER,
  getBankTransferCONTROLLER,
  getPaymentCONTROLLER,
  initiatePaymentCONTROLLER,
  listBankTransferCONTROLLER,
  listPaymentsCONTROLLER,
  recordBankTransferCONTROLLER,
  updateBankTransferCONTROLLER,
} from '../../controllers/payment.controller';
import { fundWalletCONTROLLER, withdrawFromWalletCONTROLLER } from '../../controllers/wallets.controller';

const router = express.Router();

router.patch('/bank/update', updateBankTransferCONTROLLER);
router.patch('/bank/complete', completeBankTransferCONTROLLER);
router.get('/bank', listBankTransferCONTROLLER);
router.get('/bank/:id', getBankTransferCONTROLLER);
// router.post('/', createPaymentCONTROLLER);
// router.post('/mobile-money/request', initiatePaymentCONTROLLER);
// router.post('/bank/record', recordBankTransferCONTROLLER);
// router.get('/', listPaymentsCONTROLLER);
// router.get('/:code', getPaymentCONTROLLER);
// router.post('/top-up', fundWalletCONTROLLER);
// router.post('/withdraw', withdrawFromWalletCONTROLLER);

export default router;
