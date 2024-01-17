import express from 'express';
// import { listTransactionsCONTROLLER, getTransactionCONTROLLER } from '../controllers/transaction.controller';
import { getWalletCONTROLLER, setWalletPinCONTROLLER, updateWalletPinCONTROLLER } from '../../controllers/wallets.controller';

const router = express.Router();

router.get('/', getWalletCONTROLLER);
router.post('/pin', setWalletPinCONTROLLER);
router.patch('/pin', updateWalletPinCONTROLLER);
// router.get('/:id', getTransactionCONTROLLER);
export default router;
