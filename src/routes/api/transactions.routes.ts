import express from 'express';
import { catchErrors } from '../../utils/errors';
import {
  listTransactionsCONTROLLER,
  getTransactionCONTROLLER,
  addNoteToTransactionCONTROLLER,
  statsOnTransactionsCONTROLLER,
  addDocumentToTransactionCONTROLLER,
  getTransactionsAnalyticsCONTROLLER,
} from '../../controllers/transaction.controller';

const router = express.Router();

router.get('/', catchErrors(listTransactionsCONTROLLER));
router.get('/statistics', catchErrors(statsOnTransactionsCONTROLLER));
router.get('/analytics', catchErrors(getTransactionsAnalyticsCONTROLLER));
router.get('/:id', catchErrors(getTransactionCONTROLLER));
router.patch('/:id/note', catchErrors(addNoteToTransactionCONTROLLER));
router.patch('/:id/documents', catchErrors(addDocumentToTransactionCONTROLLER));
export default router;
