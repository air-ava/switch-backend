import express from 'express';
import { fetchSettlementsCONTROLLER, listSettlementsCONTROLLER, processSettlementCONTROLLER } from '../controllers/settlement.contoller';

const router = express.Router();

router.get('/', listSettlementsCONTROLLER);
router.post('/', processSettlementCONTROLLER);
router.get('/:id', fetchSettlementsCONTROLLER);

export default router;
