import express from 'express';
import { listSchoolPeriodsCONTROLLER } from '../controllers/session.controller';
import {
  accountUseCaseQuestionnaireCONTROLLER,
  schoolInfoCONTROLLER,
  schoolContactCONTROLLER,
  schoolOwnerCONTROLLER,
  answerUseCaseQuestionnaireCONTROLLER,
  getSchoolCONTROLLER,
  updateSchoolCONTROLLER,
  getDocumentRequirementCONTROLLER,
  addOnboardingDocumentsCONTROLLER,
  addClassToSchoolCONTROLLER,
  listClassInSchoolCONTROLLER,
} from '../controllers/school.controller';
import { catchErrors } from '../utils/errors';

const router = express.Router();

router.get('/', getSchoolCONTROLLER);
router.patch('/', updateSchoolCONTROLLER);
router.post('/info', schoolInfoCONTROLLER);
router.post('/contact', schoolContactCONTROLLER);
router.post('/owner', schoolOwnerCONTROLLER);
router.get('/documents', getDocumentRequirementCONTROLLER);
router.post('/documents', addOnboardingDocumentsCONTROLLER);
router.get('/questionnaire', accountUseCaseQuestionnaireCONTROLLER);
router.post('/questionnaire', answerUseCaseQuestionnaireCONTROLLER);
router.post('/class', catchErrors(addClassToSchoolCONTROLLER));
router.get('/class', catchErrors(listClassInSchoolCONTROLLER));
router.get('/periods', catchErrors(listSchoolPeriodsCONTROLLER));

export default router;
