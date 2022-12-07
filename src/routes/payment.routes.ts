import express from 'express';
import { createPaymentCONTROLLER, getPaymentCONTROLLER, listPaymentsCONTROLLER } from '../controllers/payment.controller';

const router = express.Router();

router.post('/', createPaymentCONTROLLER);
router.get('/', listPaymentsCONTROLLER);
router.get('/:code', getPaymentCONTROLLER);

export default router;
