import express from 'express';
import { countriesCONTROLLER, educationLevelCONTROLLER, getCurrenciesCONTROLLER, jobTitlesCONTROLLER, uploadCONTROLLER } from '../controllers/miscillaneous.controller';
import { listClassCONTROLLER } from '../controllers/student.controller';

const router = express.Router();

router.get('/countries', countriesCONTROLLER);
router.get('/currencies', getCurrenciesCONTROLLER);
router.post('/upload', uploadCONTROLLER);
router.get('/class', listClassCONTROLLER);
router.get('/education/level', educationLevelCONTROLLER);
router.get('/job-titles', jobTitlesCONTROLLER);

export default router;
