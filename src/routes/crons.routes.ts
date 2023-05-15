import express from 'express';
import { catchErrors } from '../utils/errors';
import {
  createCronCONTROLLER,
  deleteCronCONTROLLER,
  getCronCONTROLLER,
  getCronHistoryCONTROLLER,
  listCronCONTROLLER,
  updateCronCONTROLLER,
} from '../controllers/crons.controller';

const router = express.Router();

router.get('/', catchErrors(listCronCONTROLLER));
router.post('/', catchErrors(createCronCONTROLLER));
router.get('/:id', catchErrors(getCronCONTROLLER));
router.patch('/:id', catchErrors(updateCronCONTROLLER));
router.delete('/:id', catchErrors(deleteCronCONTROLLER));
router.get('/:id/history', catchErrors(getCronHistoryCONTROLLER));

export default router;
