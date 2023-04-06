import express from 'express';
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
  verifySchoolCONTROLLER,
  updateSchoolAdminCONTROLLER,
} from '../../controllers/school.controller';

const router = express.Router();

router.get('/', listSchoolCONTROLLER);
router.post('/verify', verifySchoolCONTROLLER);
router.patch('/:id', updateSchoolAdminCONTROLLER);
// router.get('/', getSchoolCONTROLLER);
// router.post('/info', schoolInfoCONTROLLER);
// router.post('/contact', schoolContactCONTROLLER);
// router.post('/owner', schoolOwnerCONTROLLER);
// router.get('/documents', getDocumentRequirementCONTROLLER);
// router.post('/documents', addOnboardingDocumentsCONTROLLER);
// router.get('/questionnaire', accountUseCaseQuestionnaireCONTROLLER);
// router.post('/questionnaire', answerUseCaseQuestionnaireCONTROLLER);

export default router;
