import express from 'express';
import {
  createAddressCONTROLLER,
  getAddressCONTROLLER,
  getCountryStatesCONTROLLER,
  getStatesDistrictsCONTROLLER,
} from '../../controllers/address.controller';
import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.get('/', getAddressCONTROLLER);
router.get('/states', catchErrors(getCountryStatesCONTROLLER));
router.get('/cities', catchErrors(getStatesDistrictsCONTROLLER));
router.post('/', createAddressCONTROLLER);

export default router;
