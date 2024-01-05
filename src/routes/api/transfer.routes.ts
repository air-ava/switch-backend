import express from 'express';
import { validateAccountDetailsCONTROLLER, getBankListCONTROLLER } from '../../controllers/transfer.controller';

const router = express.Router();

router.post('/verify', validateAccountDetailsCONTROLLER);
router.post('/bank', getBankListCONTROLLER);

export default router;
