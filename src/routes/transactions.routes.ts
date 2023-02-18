import express from 'express';
import {
  listTransactionsCONTROLLER,
  getTransactionCONTROLLER,
  addNoteToTransactionCONTROLLER,
  statsOnTransactionsCONTROLLER,
} from '../controllers/transaction.controller';

const router = express.Router();

router.get('/', listTransactionsCONTROLLER);
router.get('/statistics', statsOnTransactionsCONTROLLER);
router.get('/:id', getTransactionCONTROLLER);
router.patch('/:id/note', addNoteToTransactionCONTROLLER);
export default router;
