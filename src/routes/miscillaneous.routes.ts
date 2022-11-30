import express from 'express';
import { countriesCONTROLLER, educationLevelCONTROLLER, getCurrenciesCONTROLLER, uploadCONTROLLER } from '../controllers/miscillaneous.controller';

const router = express.Router();

router.get('/countries', countriesCONTROLLER);
router.get('/currencies', getCurrenciesCONTROLLER);
router.post('/upload', uploadCONTROLLER);
router.get('/education/level', educationLevelCONTROLLER);

export default router;
