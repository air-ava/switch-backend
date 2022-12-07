import express from 'express';
import { listTransactionsCONTROLLER, getTransactionCONTROLLER } from '../controllers/transaction.controller';

const router = express.Router();

router.get('/', listTransactionsCONTROLLER);
router.get('/:id', getTransactionCONTROLLER);
export default router;
