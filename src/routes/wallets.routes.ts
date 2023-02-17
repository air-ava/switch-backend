import express from 'express';
// import { listTransactionsCONTROLLER, getTransactionCONTROLLER } from '../controllers/transaction.controller';
import { getWalletCONTROLLER } from '../controllers/wallets.controller';

const router = express.Router();

router.get('/', getWalletCONTROLLER);
// router.get('/:id', getTransactionCONTROLLER);
export default router;
