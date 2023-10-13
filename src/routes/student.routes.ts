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
  classAnalysisCONTROLLER,
  classDetailsCONTROLLER,
  getStudentPaymentHistoryCONTROLLER,
  getStudentFeesCONTROLLER,
  deactivateStudentFeeCONTROLLER,
  deactivateStudentCONTROLLER,
  editStudentFeeCONTROLLER,
  getStudentFeesLightCONTROLLER,
} from '../controllers/student.controller';
import { catchErrors } from '../utils/errors';

const router = express.Router();

router.get('/', catchErrors(listStudentCONTROLLER));
router.post('/', catchErrors(addStudentToSchoolCONTROLLER));
router.get('/class', catchErrors(listStundentsInSchoolClassCONTROLLER));
router.get('/class/:code/detail', catchErrors(classDetailsCONTROLLER));
router.get('/class/:code/analysis', catchErrors(classAnalysisCONTROLLER));
router.get('/:code/history', catchErrors(getStudentPaymentHistoryCONTROLLER));
router.get('/:code/fees', catchErrors(getStudentFeesCONTROLLER));
router.get('/:code/fees-light', catchErrors(getStudentFeesLightCONTROLLER));
router.delete('/:code/fees/:feeCode', catchErrors(deactivateStudentFeeCONTROLLER));
router.patch('/:code/fees/:feeCode', catchErrors(editStudentFeeCONTROLLER));
router.delete('/:code', catchErrors(deactivateStudentCONTROLLER));
router.get('/:code', catchErrors(getStudentCONTROLLER));
router.post('/search', catchErrors(searchStudentCONTROLLER));
router.post('/bulk', catchErrors(addBulkStudentsToSchoolCONTROLLER));
router.patch('/:id', catchErrors(editStudentCONTROLLER));
router.patch('/:id/guardians', catchErrors(addGuardiansToStudentCONTROLLER));

export default router;
