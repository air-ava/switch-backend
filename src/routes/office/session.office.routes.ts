import express from 'express';
import { createSessionCONTROLLER } from '../../controllers/session.controller';

import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.post('/', catchErrors(createSessionCONTROLLER));

export default router;
