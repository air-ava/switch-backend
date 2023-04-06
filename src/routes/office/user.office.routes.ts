import express from 'express';
import {
  backOfficeVerifiesAccountCONTROLLER,
  changePasswordCONTROLLER,
  resetPasswordCONTROLLER,
  verifyCONTROLLER,
} from '../../controllers/auth.controller';
import { fetchUserCONTROLLER, listUsersCONTROLLER, updateUserCONTROLLER } from '../../controllers/user.contoller';

const router = express.Router();

router.get('/', listUsersCONTROLLER);
router.post('/verify/:id', backOfficeVerifiesAccountCONTROLLER);
// router.post('/reset', resetPasswordCONTROLLER);
// router.patch('/password', changePasswordCONTROLLER);
// router.patch('/', updateUserCONTROLLER);
// router.get('/', fetchUserCONTROLLER);

export default router;
