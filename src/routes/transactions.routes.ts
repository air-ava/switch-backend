import express from 'express';
import {
  listTransactionsCONTROLLER,
  getTransactionCONTROLLER,
  addNoteToTransactionCONTROLLER,
  statsOnTransactionsCONTROLLER,
  addDocumentToTransactionCONTROLLER,
} from '../controllers/transaction.controller';

const router = express.Router();

router.get('/', listTransactionsCONTROLLER);
router.get('/statistics', statsOnTransactionsCONTROLLER);
router.get('/:id', getTransactionCONTROLLER);
router.patch('/:id/note', addNoteToTransactionCONTROLLER);
router.patch('/:id/documents', addDocumentToTransactionCONTROLLER);
export default router;
