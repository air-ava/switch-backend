import express from 'express';
import { listDocumentsCONTROLLER, verifyDocumentCONTROLLER } from '../../controllers/document.controller';
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
router.post('/verify/:id', verifyDocumentCONTROLLER);
// router.get('/', getSchoolCONTROLLER);
// router.patch('/', updateSchoolCONTROLLER);
// router.post('/info', schoolInfoCONTROLLER);
// router.post('/contact', schoolContactCONTROLLER);
// router.post('/owner', schoolOwnerCONTROLLER);
// router.get('/questionnaire', accountUseCaseQuestionnaireCONTROLLER);
// router.post('/questionnaire', answerUseCaseQuestionnaireCONTROLLER);

export default router;
