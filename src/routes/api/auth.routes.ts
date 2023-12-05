import express from 'express';
import {
  forgotCONTROLLER,
  loginCONTROLLER,
  newPasswordCONTROLLER,
  resendCONTROLLER,
  resetPasswordCONTROLLER,
  signUpCONTROLLER,
  verifyCONTROLLER,
} from '../../controllers/auth.controller';
import { guardianLoginCONTROLLER } from '../../controllers/guardian.controller';
import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.post('/register', signUpCONTROLLER);
router.post('/login', loginCONTROLLER);
router.post('/forgot', forgotCONTROLLER);
router.post('/change', newPasswordCONTROLLER);
router.post('/resend/:identity', resendCONTROLLER);
// router.post('/resend/:email', resendCONTROLLER);
router.post('/verify/:userId', verifyCONTROLLER);
router.post('/reset/:code', resetPasswordCONTROLLER);
router.post('/verify', verifyCONTROLLER);
router.post('/guardian/login', catchErrors(guardianLoginCONTROLLER));

export default router;
