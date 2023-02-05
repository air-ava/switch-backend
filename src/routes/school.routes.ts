import express from 'express';
import {
  accountUseCaseQuestionnaireCONTROLLER,
  schoolInfoCONTROLLER,
  schoolContactCONTROLLER,
  schoolOwnerCONTROLLER,
  answerUseCaseQuestionnaireCONTROLLER,
  getSchoolCONTROLLER,
  updateSchoolCONTROLLER,
} from '../controllers/school.controller';

const router = express.Router();

router.get('/', getSchoolCONTROLLER);
router.patch('/', updateSchoolCONTROLLER);
router.post('/info', schoolInfoCONTROLLER);
router.post('/contact', schoolContactCONTROLLER);
router.post('/owner', schoolOwnerCONTROLLER);
// router.get('/:ref', getBusinessCONTROLLER);
router.get('/questionnaire', accountUseCaseQuestionnaireCONTROLLER);
router.post('/questionnaire', answerUseCaseQuestionnaireCONTROLLER);

export default router;
