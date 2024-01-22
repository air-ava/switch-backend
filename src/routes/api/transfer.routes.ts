import express from 'express';
import { catchErrors } from '../../utils/errors';
import { validateAccountDetailsCONTROLLER, getBankListCONTROLLER, bankTransferCONTROLLER } from '../../controllers/transfer.controller';
import wemaRoutes from './wema.routes';

const router = express.Router();

router.post('/', catchErrors(bankTransferCONTROLLER));
router.post('/verify', catchErrors(validateAccountDetailsCONTROLLER));
router.get('/bank', catchErrors(getBankListCONTROLLER));
router.use('/wema', wemaRoutes);

export default router;
