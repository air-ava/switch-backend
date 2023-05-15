import express from 'express';
import { getSchoolCONTROLLER } from '../controllers/school.controller';
import {
  addStudentToSchoolCONTROLLER,
  getStudentCONTROLLER,
  listStudentCONTROLLER,
  searchStudentCONTROLLER,
  addBulkStudentsToSchoolCONTROLLER,
} from '../controllers/student.controller';
import { catchErrors } from '../utils/errors';

const router = express.Router();

router.get('/', listStudentCONTROLLER);
router.post('/', addStudentToSchoolCONTROLLER);
router.get('/:code', getStudentCONTROLLER);
router.post('/search', catchErrors(searchStudentCONTROLLER));
router.post('/bulk', catchErrors(addBulkStudentsToSchoolCONTROLLER));

export default router;
