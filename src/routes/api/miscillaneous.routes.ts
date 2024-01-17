import express from 'express';
import {
  countriesCONTROLLER,
  educationLevelCONTROLLER,
  getCurrenciesCONTROLLER,
  jobTitlesCONTROLLER,
  uploadCONTROLLER,
} from '../../controllers/miscillaneous.controller';
import { listClassCONTROLLER } from '../../controllers/student.controller';
import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.get('/countries', catchErrors(countriesCONTROLLER));
router.get('/currencies', catchErrors(getCurrenciesCONTROLLER));
router.post('/upload', catchErrors(uploadCONTROLLER));
router.get('/class', catchErrors(listClassCONTROLLER));
router.get('/education/level', catchErrors(educationLevelCONTROLLER));
router.get('/education', catchErrors(educationLevelCONTROLLER));
router.get('/job-titles', catchErrors(jobTitlesCONTROLLER));

export default router;
