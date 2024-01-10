import express from 'express';
import { changePasswordCONTROLLER, resetPasswordCONTROLLER, verifyCONTROLLER } from '../../controllers/auth.controller';
import { fetchUserCONTROLLER, updateUserCONTROLLER } from '../../controllers/user.contoller';
import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.post('/verify', verifyCONTROLLER);
router.post('/reset', resetPasswordCONTROLLER);
router.patch('/password', changePasswordCONTROLLER);
router.patch('/', updateUserCONTROLLER);
router.get('/', catchErrors(fetchUserCONTROLLER));

export default router;
