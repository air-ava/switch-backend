import express from 'express';
import { processSettlementCONTROLLER } from '../controllers/settlement.contoller';

const router = express.Router();

// router.get('/', listBanksCONTROLLER);
router.post('/', processSettlementCONTROLLER);
// router.patch('/:id', defaulBankCONTROLLER);

export default router;
