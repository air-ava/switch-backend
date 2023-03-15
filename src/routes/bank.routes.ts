import express from 'express';
import { listBanksCONTROLLER, addBankCONTROLLER, defaulBankCONTROLLER, bankListCONTROLLER } from '../controllers/bank.contoller';

const router = express.Router();

router.get('/', listBanksCONTROLLER);
router.get('/name', bankListCONTROLLER);
router.post('/', addBankCONTROLLER);
router.patch('/:id', defaulBankCONTROLLER);

export default router;
