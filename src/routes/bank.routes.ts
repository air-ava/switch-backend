import express from 'express';
import { listBanksCONTROLLER, addBankCONTROLLER, defaulBankCONTROLLER } from '../controllers/bank.contoller';

const router = express.Router();

router.get('/', listBanksCONTROLLER);
router.post('/', addBankCONTROLLER);
router.patch('/:id', defaulBankCONTROLLER);

export default router;
