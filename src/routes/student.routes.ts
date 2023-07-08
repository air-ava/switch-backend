import express from 'express';
import { getSchoolCONTROLLER } from '../controllers/school.controller';
import {
  addStudentToSchoolCONTROLLER,
  getStudentCONTROLLER,
  listStudentCONTROLLER,
  searchStudentCONTROLLER,
  addBulkStudentsToSchoolCONTROLLER,
  addGuardiansToStudentCONTROLLER,
  editStudentCONTROLLER,
  listStundentsInSchoolClassCONTROLLER,
} from '../controllers/student.controller';
import { catchErrors } from '../utils/errors';

const router = express.Router();

router.get('/', catchErrors(listStudentCONTROLLER));
router.post('/', addStudentToSchoolCONTROLLER);
router.get('/class', catchErrors(listStundentsInSchoolClassCONTROLLER));
router.get('/:code', catchErrors(getStudentCONTROLLER));
router.post('/search', catchErrors(searchStudentCONTROLLER));
router.post('/bulk', catchErrors(addBulkStudentsToSchoolCONTROLLER));
router.patch('/:id', catchErrors(editStudentCONTROLLER));
router.patch('/:id/guardians', catchErrors(addGuardiansToStudentCONTROLLER));

export default router;
