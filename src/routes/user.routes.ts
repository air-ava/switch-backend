import express from 'express';
import { resetPasswordCONTROLLER, verifyCONTROLLER } from '../controllers/auth.controller';

const router = express.Router();

router.post('/verify', verifyCONTROLLER);
router.post('/reset', resetPasswordCONTROLLER);

export default router;
