import express from 'express';
import {
  createBusinessCONTROLLER,
  getBusinessCONTROLLER,
  updateBusinessCONTROLLER,
  verifyOrganisationCONTROLLER,
  viewAllBusinessCONTROLLER,
} from '../../controllers/business.controller';

const router = express.Router();

router.post('/verify', verifyOrganisationCONTROLLER);
// router.post('/create', createBusinessCONTROLLER);
// router.patch('/update/:ref', updateBusinessCONTROLLER);
// router.get('/:ref', getBusinessCONTROLLER);
// router.get('/', viewAllBusinessCONTROLLER);

export default router;
