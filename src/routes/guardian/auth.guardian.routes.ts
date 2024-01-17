import express from 'express';
import { guardianLoginCONTROLLER } from '../../controllers/guardian.controller';
import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.post('/login', catchErrors(guardianLoginCONTROLLER));

export default router;
