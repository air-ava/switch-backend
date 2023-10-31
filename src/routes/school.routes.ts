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
  addClassToSchoolWithFeesCONTROLLER,
  addClassToSchoolCONTROLLER,
  listClassInSchoolCONTROLLER,
  listClassLevelByEducationLevelCONTROLLER,
  listEducationLevelCONTROLLER,
} from '../controllers/school.controller';
import { catchErrors } from '../utils/errors';

const router = express.Router();

router.get('/', getSchoolCONTROLLER);
router.patch('/', updateSchoolCONTROLLER);
router.post('/info', catchErrors(schoolInfoCONTROLLER));
router.post('/contact', catchErrors(schoolContactCONTROLLER));
router.post('/owner', catchErrors(schoolOwnerCONTROLLER));
router.get('/documents', catchErrors(getDocumentRequirementCONTROLLER));
router.post('/documents', addOnboardingDocumentsCONTROLLER);
router.get('/questionnaire', accountUseCaseQuestionnaireCONTROLLER);
router.post('/questionnaire', answerUseCaseQuestionnaireCONTROLLER);
router.post('/class', catchErrors(addClassToSchoolWithFeesCONTROLLER));
router.post('/class/:code', catchErrors(addClassToSchoolCONTROLLER));
router.get('/class', catchErrors(listClassInSchoolCONTROLLER));
router.get('/levels/:code', catchErrors(listClassLevelByEducationLevelCONTROLLER));
router.get('/levels', catchErrors(listEducationLevelCONTROLLER));
router.get('/periods', catchErrors(listSchoolPeriodsCONTROLLER));

export default router;
