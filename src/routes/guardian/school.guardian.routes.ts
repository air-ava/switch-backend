import express from 'express';
import {
  listSchoolCONTROLLER,
  verifySchoolCONTROLLER,
  updateSchoolAdminCONTROLLER,
  addClassToSchoolAdminCONTROLLER,
  listClassLevelByEducationLevelCONTROLLER,
  listEducationLevelCONTROLLER,
} from '../../controllers/school.controller';
import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.get('/', listSchoolCONTROLLER);
router.post('/verify', verifySchoolCONTROLLER);
router.patch('/:id', updateSchoolAdminCONTROLLER);
router.post('/:schoolCode/class/:code', catchErrors(addClassToSchoolAdminCONTROLLER));
router.get('/levels/:code', catchErrors(listClassLevelByEducationLevelCONTROLLER));
router.get('/levels', catchErrors(listEducationLevelCONTROLLER));

export default router;
