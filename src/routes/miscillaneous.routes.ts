import express from 'express';
import { countriesCONTROLLER, educationLevelCONTROLLER, getCurrenciesCONTROLLER, uploadCONTROLLER } from '../controllers/miscillaneous.controller';
import { listClassCONTROLLER } from '../controllers/student.controller';

const router = express.Router();

router.get('/countries', countriesCONTROLLER);
router.get('/currencies', getCurrenciesCONTROLLER);
router.post('/upload', uploadCONTROLLER);
router.get('/education/level', educationLevelCONTROLLER);
router.get('/class', listClassCONTROLLER);

export default router;
