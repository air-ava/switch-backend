import express from 'express';
import { countriesCONTROLLER, getCurrenciesCONTROLLER, uploadCONTROLLER } from '../controllers/miscillaneous.controller';

const router = express.Router();

router.get('/countries', countriesCONTROLLER);
router.get('/currencies', getCurrenciesCONTROLLER);
router.post('/upload', uploadCONTROLLER);

export default router;
