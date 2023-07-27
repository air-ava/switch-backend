import express from 'express';
import {
  addFeeCONTROLLER,
  getSchoolProductCONTROLLER,
  listFeesCONTROLLER,
  addFeeTypeCONTROLLER,
  listFeeTypesCONTROLLER,
  listClassFeeCONTROLLER,
  feeDetailsCONTROLLER,
  deleteFeeCONTROLLER,
  deleteFeesCONTROLLER,
  getFeesInClassCONTROLLER,
} from '../controllers/fees.controller';
import { catchErrors } from '../utils/errors';

const router = express.Router();

router.get('/types', catchErrors(listFeeTypesCONTROLLER));
router.get('/class', catchErrors(listClassFeeCONTROLLER));
router.get('/class/:code', catchErrors(getFeesInClassCONTROLLER));
router.get('/details', catchErrors(feeDetailsCONTROLLER));
router.get('/:code', catchErrors(getSchoolProductCONTROLLER));
router.delete('/:code', catchErrors(deleteFeeCONTROLLER));
router.delete('/', catchErrors(deleteFeesCONTROLLER));
router.get('/', catchErrors(listFeesCONTROLLER));
router.post('/types', catchErrors(addFeeTypeCONTROLLER));
router.post('/', catchErrors(addFeeCONTROLLER));

export default router;
