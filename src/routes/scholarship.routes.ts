import express from 'express';
import { createSchorlashipCONTROLLER, getScholarshipCONTROLLER, getScholarshipsCONTROLLER } from '../controllers/scholarship.controller';

const router = express.Router();

router.get('/', getScholarshipsCONTROLLER);
router.get('/:code', getScholarshipCONTROLLER);
router.post('/', createSchorlashipCONTROLLER);

export default router;
