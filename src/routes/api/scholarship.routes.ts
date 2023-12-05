import express from 'express';
import {
  addSponsorsCONTROLLER,
  createEligibilityCONTROLLER,
  createSchorlashipCONTROLLER,
  getApplicationCONTROLLER,
  getScholarshipCONTROLLER,
  getScholarshipsCONTROLLER,
} from '../../controllers/scholarship.controller';

const router = express.Router();

router.get('/', getScholarshipsCONTROLLER);
router.get('/:code', getScholarshipCONTROLLER);
router.post('/', createSchorlashipCONTROLLER);
router.post('/:code/eligibility', createEligibilityCONTROLLER);
router.post('/:code/sponsor', addSponsorsCONTROLLER);
router.get('/:code/application', getApplicationCONTROLLER);

export default router;
