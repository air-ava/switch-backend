import express from 'express';
import { changePasswordCONTROLLER, resetPasswordCONTROLLER, verifyCONTROLLER } from '../controllers/auth.controller';

const router = express.Router();

router.post('/verify', verifyCONTROLLER);
router.post('/reset', resetPasswordCONTROLLER);
router.patch('/password', changePasswordCONTROLLER);

export default router;
