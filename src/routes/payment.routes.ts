import express from 'express';
import { createPaymentCONTROLLER } from '../controllers/payment.controller';

const router = express.Router();

router.post('/', createPaymentCONTROLLER);

export default router;
