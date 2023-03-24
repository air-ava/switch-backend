import express from 'express';
import { listDocumentsCONTROLLER } from '../../controllers/document.controller';
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
  listSchoolCONTROLLER,
} from '../../controllers/school.controller';

const router = express.Router();

router.get('/', listDocumentsCONTROLLER);
router.get('/requirement', getDocumentRequirementCONTROLLER);
router.post('/upload', addOnboardingDocumentsCONTROLLER);
// router.get('/', getSchoolCONTROLLER);
// router.patch('/', updateSchoolCONTROLLER);
// router.post('/info', schoolInfoCONTROLLER);
// router.post('/contact', schoolContactCONTROLLER);
// router.post('/owner', schoolOwnerCONTROLLER);
// router.get('/questionnaire', accountUseCaseQuestionnaireCONTROLLER);
// router.post('/questionnaire', answerUseCaseQuestionnaireCONTROLLER);

export default router;
