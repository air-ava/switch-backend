import { catchErrors } from './../../utils/errors';
import express from 'express';
import { validateAccountDetailsCONTROLLER, getBankListCONTROLLER } from '../../controllers/transfer.controller';

const router = express.Router();

// router.post('/', bankTransferCONTROLLER);
router.post('/verify', catchErrors(validateAccountDetailsCONTROLLER));
router.post('/bank', catchErrors(getBankListCONTROLLER));

export default router;
