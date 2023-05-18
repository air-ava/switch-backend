import express from 'express';
import {
  addBulkStudentsToSchoolAdminCONTROLLER,
  addStudentToSchoolAdminCONTROLLER,
  listStudentAdminCONTROLLER,
  searchStudentAdminCONTROLLER,
} from '../../controllers/student.controller';

import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.get('/', listStudentAdminCONTROLLER);
router.post('/', addStudentToSchoolAdminCONTROLLER);
// router.get('/:code', getStudentCONTROLLER);
router.post('/search', catchErrors(searchStudentAdminCONTROLLER));
router.post('/bulk', catchErrors(addBulkStudentsToSchoolAdminCONTROLLER));

export default router;
