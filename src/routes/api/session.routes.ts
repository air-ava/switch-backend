import express from 'express';
import {
  listEducationalLevels,
  listPeriodsCONTROLLER,
  createSchoolPeriodCONTROLLER,
  listSessionsCONTROLLER,
} from '../../controllers/session.controller';

import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.post('/period', catchErrors(createSchoolPeriodCONTROLLER));
router.get('/period', catchErrors(listPeriodsCONTROLLER));
router.get('/', catchErrors(listSessionsCONTROLLER));
router.get('/levels', catchErrors(listEducationalLevels));

export default router;
