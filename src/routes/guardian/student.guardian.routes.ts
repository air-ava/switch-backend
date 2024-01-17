import express from 'express';
import {
  getStudent_GUARDIAN_CONTROLLER,
  getStudentFees_GUARDIAN_CONTROLLER,
  getStudentDetail_GUARDIAN_CONTROLLER,
  getStudentPaymentHistory_GUARDIAN_CONTROLLER,
} from '../../controllers/student.controller';

import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.get('/', catchErrors(getStudent_GUARDIAN_CONTROLLER));
router.get('/fees', catchErrors(getStudentFees_GUARDIAN_CONTROLLER));
router.get('/history', catchErrors(getStudentPaymentHistory_GUARDIAN_CONTROLLER));
router.get('/details', catchErrors(getStudentDetail_GUARDIAN_CONTROLLER));
// router.post('/', catchErrors(addStudentToSchoolAdminCONTROLLER));
// // router.get('/:code', getStudentCONTROLLER);
// router.post('/search', catchErrors(searchStudentAdminCONTROLLER));
// router.post('/bulk', catchErrors(addBulkStudentsToSchoolAdminCONTROLLER));
// router.patch('/:id', catchErrors(editStudentCONTROLLER));
// router.patch('/:id/guardians', catchErrors(addGuardiansToStudentCONTROLLER));

export default router;
