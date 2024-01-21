import express from 'express';
import { createSessionCONTROLLER, listPeriodsCONTROLLER, listSessionsCONTROLLER } from '../../controllers/session.controller';

import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.post('/', catchErrors(createSessionCONTROLLER));
router.get('/period', catchErrors(listPeriodsCONTROLLER));
router.get('/', catchErrors(listSessionsCONTROLLER));

export default router;
