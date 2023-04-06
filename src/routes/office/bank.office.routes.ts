import express from 'express';
import {
  listBanksCONTROLLER,
  addBankCONTROLLER,
  defaulBankCONTROLLER,
  bankListCONTROLLER,
  deleteBankCONTROLLER,
  listBanksBackOfficeCONTROLLER,
} from '../../controllers/bank.contoller';

const router = express.Router();

router.get('/', listBanksBackOfficeCONTROLLER);
// router.get('/name', bankListCONTROLLER);
// router.post('/', addBankCONTROLLER);
// router.patch('/:id', defaulBankCONTROLLER);
// router.delete('/:id', deleteBankCONTROLLER);

export default router;
