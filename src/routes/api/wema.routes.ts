import express from 'express';
import { catchErrors } from '../../utils/errors';
import { blockAccountCONTROLLER, fetchAccountKYCCONTROLLER, wemaStatementCONTROLLER } from '../../controllers/transfer.controller';

const router = express.Router();

router.post('/statement', catchErrors(wemaStatementCONTROLLER));
router.post('/kyc', catchErrors(fetchAccountKYCCONTROLLER));
router.post('/block', catchErrors(blockAccountCONTROLLER));

export default router;
