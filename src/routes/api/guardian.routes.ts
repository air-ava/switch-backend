import express from 'express';
import { catchErrors } from '../../utils/errors';
import { guardianLoginCONTROLLER } from '../../controllers/guardian.controller';

const router = express.Router();

// router.get('/', getSchoolCONTROLLER);
router.post('/login', catchErrors(guardianLoginCONTROLLER));
