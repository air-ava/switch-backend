import express from 'express';
import TestingController from '../../crons/testing.cron';
import { catchErrors } from '../../utils/errors';

const router = express.Router();

router.get('/', catchErrors(TestingController));

export default router;
