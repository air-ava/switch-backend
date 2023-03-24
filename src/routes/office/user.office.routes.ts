import express from 'express';
import { changePasswordCONTROLLER, resetPasswordCONTROLLER, verifyCONTROLLER } from '../../controllers/auth.controller';
import { fetchUserCONTROLLER, listUsersCONTROLLER, updateUserCONTROLLER } from '../../controllers/user.contoller';

const router = express.Router();

// router.post('/verify', verifyCONTROLLER);
// router.post('/reset', resetPasswordCONTROLLER);
// router.patch('/password', changePasswordCONTROLLER);
// router.patch('/', updateUserCONTROLLER);
// router.get('/', fetchUserCONTROLLER);
router.get('/', listUsersCONTROLLER);

export default router;
