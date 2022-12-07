import express from 'express';
import { createPaymentCONTROLLER, listPaymentsCONTROLLER } from '../controllers/payment.controller';

const router = express.Router();

router.post('/', createPaymentCONTROLLER);
router.get('/', listPaymentsCONTROLLER);
router.get('/:code', createPaymentCONTROLLER);

export default router;
