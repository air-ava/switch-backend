import express from 'express';
import { listSettlementsCONTROLLER, processSettlementCONTROLLER } from '../controllers/settlement.contoller';

const router = express.Router();

router.get('/', listSettlementsCONTROLLER);
router.post('/', processSettlementCONTROLLER);
// router.patch('/:id', defaulBankCONTROLLER);

export default router;
