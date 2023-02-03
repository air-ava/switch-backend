import express from 'express';
import {
  createBusinessCONTROLLER,
  getBusinessCONTROLLER,
  updateBusinessCONTROLLER,
  viewAllBusinessCONTROLLER,
} from '../controllers/business.controller';

const router = express.Router();

router.post('/info', createBusinessCONTROLLER);
router.patch('/update/:ref', updateBusinessCONTROLLER);
router.get('/:ref', getBusinessCONTROLLER);
router.get('/', viewAllBusinessCONTROLLER);

export default router;
