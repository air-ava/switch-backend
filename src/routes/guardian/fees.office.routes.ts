import express from 'express';
import { addFeeTypeCONTROLLER, addFeeAdminCONTROLLER, listFeeTypesCONTROLLER, listFeeTypesAdminCONTROLLER } from '../../controllers/fees.controller';
import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.post('/:code', catchErrors(addFeeAdminCONTROLLER));
router.get('/types/:code', catchErrors(listFeeTypesAdminCONTROLLER));

export default router;
