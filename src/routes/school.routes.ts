import express from 'express';
import {
  accountUseCaseQuestionnaireCONTROLLER,
  schoolInfoCONTROLLER,
  schoolContactCONTROLLER,
  schoolOwnerCONTROLLER,
} from '../controllers/school.controller';

const router = express.Router();

router.post('/info', schoolInfoCONTROLLER);
router.post('/contact', schoolContactCONTROLLER);
router.post('/owner', schoolOwnerCONTROLLER);
// router.get('/:ref', getBusinessCONTROLLER);
router.get('/questionnaire', accountUseCaseQuestionnaireCONTROLLER);
router.post('/questionnaire', accountUseCaseQuestionnaireCONTROLLER);

export default router;
