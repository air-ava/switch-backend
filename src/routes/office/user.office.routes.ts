import express from 'express';
import {
  backOfficeVerifiesAccountCONTROLLER,
  changePasswordCONTROLLER,
  resetPasswordCONTROLLER,
  verifyCONTROLLER,
} from '../../controllers/auth.controller';
import {
  fetchUserCONTROLLER,
  getUserCONTROLLER,
  listAdninUsersCONTROLLER,
  listUsersCONTROLLER,
  updateUserCONTROLLER,
} from '../../controllers/user.contoller';
import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.get('/admin', catchErrors(listAdninUsersCONTROLLER));
router.get('/', listUsersCONTROLLER);
router.get('/:id', getUserCONTROLLER);
router.post('/verify/:id', backOfficeVerifiesAccountCONTROLLER);
// router.post('/reset', resetPasswordCONTROLLER);
// router.patch('/password', changePasswordCONTROLLER);
// router.patch('/', updateUserCONTROLLER);
// router.get('/', fetchUserCONTROLLER);

export default router;
