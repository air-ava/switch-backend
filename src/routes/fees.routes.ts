import express from 'express';
import {
  addFeeCONTROLLER,
  getSchoolProductCONTROLLER,
  listFeesCONTROLLER,
  addFeeTypeCONTROLLER,
  listFeeTypesCONTROLLER,
} from '../controllers/fees.controller';
import { catchErrors } from '../utils/errors';

const router = express.Router();

router.get('/types', catchErrors(listFeeTypesCONTROLLER));
router.get('/:code', catchErrors(getSchoolProductCONTROLLER));
router.get('/', catchErrors(listFeesCONTROLLER));
router.post('/types', catchErrors(addFeeTypeCONTROLLER));
router.post('/', catchErrors(addFeeCONTROLLER));

export default router;
