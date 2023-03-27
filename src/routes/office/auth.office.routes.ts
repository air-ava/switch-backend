import express from 'express';
import {
  adminLoginCONTROLLER,
  adminSignUpCONTROLLER,
  adminVerifyCONTROLLER,
  forgotCONTROLLER,
  newPasswordCONTROLLER,
  resendCONTROLLER,
  resetPasswordCONTROLLER,
} from '../../controllers/auth.controller';

const router = express.Router();

router.post('/register', adminSignUpCONTROLLER);
router.post('/login', adminLoginCONTROLLER);
router.post('/verify', adminVerifyCONTROLLER);

// router.post('/forgot', forgotCONTROLLER);
// router.post('/change', newPasswordCONTROLLER);
// router.post('/resend/:email', resendCONTROLLER);
// router.post('/verify/:userId', verifyCONTROLLER);
// router.post('/reset/:code', resetPasswordCONTROLLER);

export default router;
